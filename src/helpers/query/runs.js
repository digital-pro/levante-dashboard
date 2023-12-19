import _pick from 'lodash/pick';
import _get from 'lodash/get';
import _mapValues from 'lodash/mapValues';
import _without from 'lodash/without';
import _zip from 'lodash/zip';
import { convertValues, getAxiosInstance, mapFields } from './utils';
import { pluralizeFirestoreCollection } from '@/helpers';

export const getRunsRequestBody = ({
  administrationId,
  orgType,
  orgId,
  taskId,
  aggregationQuery,
  pageLimit,
  page,
  paginate = true,
  select = ['scores.computed.composite'],
  allDescendants = true,
  requireCompleted = false,
}) => {
  const requestBody = {
    structuredQuery: {},
  };

  if (!aggregationQuery) {
    if (paginate) {
      requestBody.structuredQuery.limit = pageLimit;
      requestBody.structuredQuery.offset = page * pageLimit;
    }

    if (select) {
      requestBody.structuredQuery.select = {
        fields: select.map((field) => ({ fieldPath: field })),
      };
    }
  }

  requestBody.structuredQuery.from = [
    {
      collectionId: 'runs',
      allDescendants: allDescendants,
    },
  ];

  if (administrationId && (orgId || !allDescendants)) {
    requestBody.structuredQuery.where = {
      compositeFilter: {
        op: 'AND',
        filters: [
          {
            fieldFilter: {
              field: { fieldPath: 'assignmentId' },
              op: 'EQUAL',
              value: { stringValue: administrationId },
            },
          },
          {
            fieldFilter: {
              field: { fieldPath: 'bestRun' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
        ],
      },
    };

    if (orgId) {
      requestBody.structuredQuery.where.compositeFilter.filters.push({
        fieldFilter: {
          field: { fieldPath: `readOrgs.${pluralizeFirestoreCollection(orgType)}` },
          op: 'ARRAY_CONTAINS',
          value: { stringValue: orgId },
        },
      });
    }
  } else {
    requestBody.structuredQuery.where = {
      compositeFilter: {
        op: 'AND',
        filters: [
          {
            fieldFilter: {
              field: { fieldPath: 'bestRun' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
        ],
      },
    };
  }

  if (taskId) {
    requestBody.structuredQuery.where.compositeFilter.filters.push({
      fieldFilter: {
        field: { fieldPath: 'taskId' },
        op: 'EQUAL',
        value: { stringValue: taskId },
      },
    });
  }

  if (requireCompleted) {
    requestBody.structuredQuery.where.compositeFilter.filters.push({
      fieldFilter: {
        field: { fieldPath: 'completed' },
        op: 'EQUAL',
        value: { booleanValue: true },
      },
    });
  }

  if (aggregationQuery) {
    return {
      structuredAggregationQuery: {
        ...requestBody,
        aggregations: [
          {
            alias: 'count',
            count: {},
          },
        ],
      },
    };
  }

  return requestBody;
};

export const runCounter = (administrationId, orgType, orgId) => {
  const axiosInstance = getAxiosInstance('app');
  const requestBody = getRunsRequestBody({
    administrationId,
    orgType,
    orgId,
    aggregationQuery: true,
  });
  return axiosInstance.post(':runAggregationQuery', requestBody).then(({ data }) => {
    return Number(convertValues(data[0].result?.aggregateFields?.count));
  });
};

export const runPageFetcher = async ({
  administrationId,
  userId,
  orgType,
  orgId,
  taskId,
  pageLimit,
  page,
  select = ['scores.computed.composite'],
  scoreKey = 'scores.computed.composite',
  paginate = true,
}) => {
  const appAxiosInstance = getAxiosInstance('app');
  const requestBody = getRunsRequestBody({
    administrationId,
    orgType,
    orgId,
    taskId,
    allDescendants: userId === undefined,
    aggregationQuery: false,
    pageLimit: paginate ? pageLimit.value : undefined,
    page: paginate ? page.value : undefined,
    paginate: paginate,
    select: select,
  });
  const runQuery = userId === undefined ? ':runQuery' : `/users/${userId}:runQuery`;
  return appAxiosInstance.post(runQuery, requestBody).then(async ({ data }) => {
    const runData = mapFields(data);

    const userDocPaths = _without(
      data.map((runDoc) => {
        if (runDoc.document?.name) {
          return runDoc.document.name.split('/runs/')[0];
        } else {
          return undefined;
        }
      }),
      undefined,
    );

    // Use batchGet to get all user docs with one post request
    const batchUserDocs = await appAxiosInstance
      .post(':batchGet', {
        documents: userDocPaths,
        mask: { fieldPaths: ['grade', 'birthMonth', 'birthYear'] },
      })
      .then(({ data }) => {
        return _without(
          data.map(({ found }) => {
            if (found) {
              return {
                name: found.name,
                data: _mapValues(found.fields, (value) => convertValues(value)),
              };
            }
            return undefined;
          }),
          undefined,
        );
      });

    // But the order of batchGet is not guaranteed, so we need to order the docs
    // by the order of userDocPaths
    const userDocData = batchUserDocs
      .sort((a, b) => {
        return userDocPaths.indexOf(a.name) - userDocPaths.indexOf(b.name);
      })
      .map(({ data }) => data);

    const otherKeys = _without(select, scoreKey);
    const scores = _zip(userDocData, runData).map(([userData, run]) => ({
      scores: _get(run, scoreKey),
      taskId: run,
      user: userData,
      ..._pick(run, otherKeys),
    }));

    return scores;
  });
};
