import _chunk from 'lodash/chunk';
import _find from 'lodash/find';
import _flatten from 'lodash/flatten';
import _get from 'lodash/get';
import _groupBy from 'lodash/groupBy';
import _head from 'lodash/head';
import _isEmpty from 'lodash/isEmpty';
import _mapValues from 'lodash/mapValues';
import _replace from 'lodash/replace';
import _without from 'lodash/without';
import _zip from 'lodash/zip';
import { convertValues, getAxiosInstance, mapFields, matchMode2Op } from './utils';
import { pluralizeFirestoreCollection } from '@/helpers';

const userSelectFields = ['name', 'assessmentPid', 'username', 'studentData', 'schools', 'classes'];

const assignmentSelectFields = [
  'assessments',
  'assigningOrgs',
  'completed',
  'dateAssigned',
  'dateClosed',
  'dateOpened',
  'started',
  'id',
];

export const getAssignmentsRequestBody = ({
  adminId,
  orgType,
  orgId,
  aggregationQuery,
  pageLimit,
  page,
  paginate = true,
  select = [
    'assessments',
    'assigningOrgs',
    'readOrgs',
    'completed',
    'dateAssigned',
    'dateClosed',
    'dateOpened',
    'started',
    'id',
  ],
  isCollectionGroupQuery = true,
  filters = [],
}) => {
  const requestBody = {
    structuredQuery: {},
  };

  if (!aggregationQuery) {
    if (paginate) {
      requestBody.structuredQuery.limit = pageLimit;
      requestBody.structuredQuery.offset = page * pageLimit;
    }

    if (select.length > 0) {
      requestBody.structuredQuery.select = {
        fields: select.map((field) => ({ fieldPath: field })),
      };
    }
  }

  requestBody.structuredQuery.from = [
    {
      collectionId: 'assignments',
      allDescendants: isCollectionGroupQuery,
    },
  ];

  if (adminId && orgId) {
    requestBody.structuredQuery.where = {
      compositeFilter: {
        op: 'AND',
        filters: [
          {
            fieldFilter: {
              field: { fieldPath: 'id' },
              op: 'EQUAL',
              value: { stringValue: adminId },
            },
          },
          {
            fieldFilter: {
              field: { fieldPath: `readOrgs.${pluralizeFirestoreCollection(orgType)}` },
              op: 'ARRAY_CONTAINS',
              value: { stringValue: orgId },
            },
          },
        ],
      },
    };
    // if(!_isEmpty(filters)){
    //   const userFilters = (filters.map(filter => {
    //     console.log('filter ->', filter)
    //     return {
    //       fieldFilter: {
    //         field: { fieldPath: filter.field },
    //         op: "EQUAL", // Need more logic here later for different constraints
    //         value: { stringValue: filter.value }
    //       }
    //     }
    //   }))
    // } else {
    //   console.log('skipping filters')
    // }
  } else {
    const currentDate = new Date().toISOString();
    requestBody.structuredQuery.where = {
      fieldFilter: {
        field: { fieldPath: 'dateClosed' },
        op: 'GREATER_THAN_OR_EQUAL',
        value: { timestampValue: currentDate },
      },
    };
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

export const getUsersByAssignmentIdRequestBody = ({
  adminId,
  orgType,
  orgId,
  filterBy,
  aggregationQuery,
  pageLimit,
  page,
  paginate = true,
  select = userSelectFields,
}) => {
  const requestBody = {
    // orderBy: {
    //   field: { fieldPath: `assignmentsAssigned.${adminId}` },
    //   direction: "ASCENDING"
    // }
    structuredQuery: {},
  };

  if (!aggregationQuery) {
    if (paginate) {
      requestBody.structuredQuery.limit = pageLimit;
      requestBody.structuredQuery.offset = page * pageLimit;
    }

    if (select.length > 0) {
      requestBody.structuredQuery.select = {
        fields: select.map((field) => ({ fieldPath: field })),
      };
    }
  }

  requestBody.structuredQuery.from = [
    {
      collectionId: 'users',
      allDescendants: false,
    },
  ];

  requestBody.structuredQuery.where = {
    compositeFilter: {
      op: 'AND',
      filters: [
        { fieldFilter: { ...filterBy, op: 'EQUAL' } },
        {
          fieldFilter: {
            field: { fieldPath: `${pluralizeFirestoreCollection(orgType)}.current` },
            op: 'ARRAY_CONTAINS',
            value: { stringValue: orgId },
          },
        },
        {
          fieldFilter: {
            field: { fieldPath: `assignments.assigned` },
            op: 'ARRAY_CONTAINS_ANY',
            value: { arrayValue: { values: [{ stringValue: adminId }] } },
          },
        },
      ],
    },
  };

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

export const getFilteredScoresRequestBody = ({
  adminId,
  orgId,
  orgType,
  filter,
  select = ['scores'],
  aggregationQuery,
  paginate = true,
  page,
  pageLimit,
}) => {
  const requestBody = {
    structuredQuery: {},
  };
  if (!aggregationQuery) {
    if (paginate) {
      requestBody.structuredQuery.limit = pageLimit;
      requestBody.structuredQuery.offset = page * pageLimit;
    }
    requestBody.structuredQuery.select = {
      fields: select.map((field) => ({ fieldPath: field })),
    };
    requestBody.structuredQuery.from = [
      {
        collectionId: 'runs',
        allDescendants: true,
      },
    ];
    requestBody.structuredQuery.where = {
      compositeFilter: {
        op: 'AND',
        filters: [
          {
            fieldFilter: {
              field: { fieldPath: 'assignmentId' },
              op: 'EQUAL',
              value: { stringValue: adminId },
            },
          },
          {
            fieldFilter: {
              field: { fieldPath: `assigningOrgs.${pluralizeFirestoreCollection(orgType)}` },
              op: 'ARRAY_CONTAINS',
              value: { stringValue: orgId },
            },
          },
          {
            fieldFilter: {
              field: { fieldPath: 'taskId' },
              op: 'EQUAL',
              value: { stringValue: filter.taskId },
            },
          },
        ],
      },
    };
    if (filter) {
      if (filter.value === 'Above') {
        requestBody.structuredQuery.where.compositeFilter.filters.push({
          fieldFilter: {
            field: { fieldPath: filter.field },
            op: 'GREATER_THAN_OR_EQUAL',
            value: { doubleValue: 50 },
          },
        });
      } else if (filter.value === 'Average') {
        requestBody.structuredQuery.where.compositeFilter.filters.push(
          {
            fieldFilter: {
              field: { fieldPath: filter.field },
              op: 'LESS_THAN',
              value: { doubleValue: 50 },
            },
          },
          {
            fieldFilter: {
              field: { fieldPath: filter.field },
              op: 'GREATER_THAN_OR_EQUAL',
              value: { doubleValue: 25 },
            },
          },
        );
      } else if (filter.value === 'Needs Extra') {
        requestBody.structuredQuery.where.compositeFilter.filters.push({
          fieldFilter: {
            field: { fieldPath: filter.field },
            op: 'LESS_THAN',
            value: { doubleValue: 25 },
          },
        });
      }
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
  }
};

export const getScoresRequestBody = ({
  runIds,
  orgType,
  orgId,
  aggregationQuery,
  pageLimit,
  page,
  paginate = true,
  select = ['scores'],
}) => {
  const requestBody = {
    structuredQuery: {},
  };

  if (!aggregationQuery) {
    if (paginate) {
      requestBody.structuredQuery.limit = pageLimit;
      requestBody.structuredQuery.offset = page * pageLimit;
    }

    requestBody.structuredQuery.select = {
      fields: select.map((field) => ({ fieldPath: field })),
    };
  }

  requestBody.structuredQuery.from = [
    {
      collectionId: 'runs',
      allDescendants: true,
    },
  ];

  requestBody.structuredQuery.where = {
    compositeFilter: {
      op: 'AND',
      filters: [
        {
          fieldFilter: {
            field: { fieldPath: 'id' },
            op: 'IN',
            value: {
              arrayValue: {
                values: [
                  runIds.map((runId) => {
                    return { stringValue: runId };
                  }),
                ],
              },
            },
          },
        },
        {
          fieldFilter: {
            field: { fieldPath: `readOrgs.${pluralizeFirestoreCollection(orgType)}` },
            op: 'ARRAY_CONTAINS',
            value: { stringValue: orgId },
          },
        },
      ],
    },
  };

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

export const assignmentCounter = (adminId, orgType, orgId) => {
  const axiosInstance = getAxiosInstance();
  const requestBody = getAssignmentsRequestBody({
    adminId: adminId,
    orgType: orgType,
    orgId: orgId,
    aggregationQuery: true,
  });
  return axiosInstance.post(':runAggregationQuery', requestBody).then(({ data }) => {
    return Number(convertValues(data[0].result?.aggregateFields?.count));
  });
};

export const assignmentPageFetcher = async (
  adminId,
  orgType,
  orgId,
  pageLimit,
  page,
  includeScores = false,
  select = undefined,
  paginate = true,
  filters = [],
) => {
  const adminAxiosInstance = getAxiosInstance();
  const appAxiosInstance = getAxiosInstance('app');
  console.log('filters', filters);
  // Assume that filters has at most length one
  if (filters.length > 1) {
    throw new Error('You may specify at most one filter');
  }

  if (filters.length && filters[0].collection === 'users') {
    const filterBy = {
      field: { fieldPath: filters[0].field },
      op: matchMode2Op[filters[0].matchMode],
      value: { stringValue: filters[0].value },
    };

    const requestBody = getUsersByAssignmentIdRequestBody({
      adminId,
      orgType,
      orgId,
      filterBy,
      aggregationQuery: false,
      pageLimit: pageLimit.value,
      page: page.value,
      paginate,
    });
    console.log('users request', requestBody);
    return adminAxiosInstance.post(':runQuery', requestBody).then(async ({ data }) => {
      const results = mapFields(data);
      // Get assignment docs
      const assignmentDocs = _without(
        data.map((userDoc) => {
          if (userDoc.document?.name) {
            return `${userDoc.document?.name}/assignments/${adminId}`;
          }
        }),
        undefined,
      );
      console.log('assignment docs', assignmentDocs);
      const batchAssignmentDocs = await adminAxiosInstance
        .post(':batchGet', {
          documents: assignmentDocs,
        })
        .then(({ data }) => {
          console.log('data', data);
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
      console.log('retrieved docs', batchAssignmentDocs);

      // Order the assignment docs to match the userdocs
      const assignmentData = batchAssignmentDocs
        .sort((a, b) => {
          return assignmentDocs.indexOf(a.name) - assignmentDocs.indexOf(b.name);
        })
        .map(({ data }) => data);

      // Grab scores doc
      if (includeScores) {
        // Get scores docs
        const runIds = [];
        for (const assignment of assignmentData) {
          for (const task of assignment.assessments) {
            if (task.runId) runIds.push(task.runId);
          }
        }
        if (!_isEmpty(runIds)) {
          const scorePromises = [];
          for (const runChunk of _chunk(runIds, 25)) {
            const scoresRequestBody = getScoresRequestBody({
              runIds: runChunk,
              orgType: orgType,
              orgId: orgId,
              aggregationQuery: false,
              pageLimit: pageLimit.value,
              page: page.value,
              paginate: false,
            });
            scorePromises.push(
              appAxiosInstance.post(':runQuery', scoresRequestBody).then(async ({ data }) => {
                return mapFields(data);
              }),
            );
          }
          const scoreData = _flatten(await Promise.all(scorePromises));
          for (const assignment of assignmentData) {
            for (const task of assignment.assessments) {
              const runId = task.runId;
              task['scores'] = _get(
                _find(scoreData, (scoreDoc) => scoreDoc.id === runId),
                'scores',
              );
            }
          }
        }
      }
      const scoresObj = _zip(results, assignmentData).map(([userData, assignmentData]) => ({
        assignment: assignmentData,
        user: userData,
      }));
      console.log('scoresObj', scoresObj);
      return scoresObj;
    });
  } else if (filters.length && filters[0].collection === 'scores') {
    console.log('scores filter', filters);
    const requestBody = getFilteredScoresRequestBody({
      adminId: adminId,
      orgType: orgType,
      orgId: orgId,
      filter: _head(filters),
      aggregationQuery: false,
      paginate: true,
      page: page.value,
      pageLimit: pageLimit.value,
    });
    console.log('requestBody', requestBody);
    return appAxiosInstance.post(':runQuery', requestBody).then(async ({ data }) => {
      const scoresData = mapFields(data);

      // Generate a list of user docs paths
      const userDocPaths = _without(
        data.map((scoreDoc) => {
          if (scoreDoc.document?.name) {
            return _replace(scoreDoc.document.name.split('/runs/')[0], 'gse-roar-assessment', 'gse-roar-admin');
          } else {
            return undefined;
          }
        }),
        undefined,
      );

      // Use a batch get to grab the user docs
      const batchUserDocs = await adminAxiosInstance
        .post(':batchGet', {
          documents: userDocPaths,
          mask: { fieldPaths: userSelectFields },
        })
        .then(({ data }) => {
          return _without(
            data.map(({ found }) => {
              if (found) {
                return {
                  name: found.name,
                  userId: found.name.split('/users/')[1],
                  data: _mapValues(found.fields, (value) => convertValues(value)),
                };
              }
              return undefined;
            }),
            undefined,
          );
        });

      // Generate a list of assignment doc paths
      const assignmentDocPaths = userDocPaths.map((userDocPath) => {
        return `${userDocPath}/assignments/${adminId}`;
      });

      // Batch get assignment docs
      const batchAssignmentDocs = await adminAxiosInstance
        .post(':batchGet', {
          documents: assignmentDocPaths,
          mask: { fieldPaths: assignmentSelectFields },
        })
        .then(({ data }) => {
          return _without(
            data.map(({ found }) => {
              if (found) {
                return {
                  name: found.name,
                  userId: found.name.split('/users/')[1].split('/')[0],
                  data: _mapValues(found.fields, (value) => convertValues(value)),
                };
              }
              return undefined;
            }),
            undefined,
          );
        });

      // Merge the scores into the assignment object
      const scoredAssignments = batchAssignmentDocs.map((assignment) => {
        const scoredAssessments = assignment.data.assessments.map((assignment) => {
          const runId = assignment.runId;
          return {
            ...assignment,
            scores: _get(_find(scoresData, { id: runId }), 'scores'),
          };
        });
        return {
          userId: assignment.userId,
          data: {
            ...assignment.data,
            assessments: scoredAssessments,
          },
        };
      });

      // Use the list of unretrieved scores and batchGet

      // Merge the newly retrieved scores with the scoredAssignments object

      // Integrate the assignment and scores objects
      return data.map((score) => {
        const userId = score.document.name.split('/users/')[1].split('/runs/')[0];
        const assignmentDoc = _find(scoredAssignments, { userId: userId });
        const scoreData = _mapValues(score.document.fields, (value) => convertValues(value));
        const userDoc = _find(batchUserDocs, { userId: userId });
        console.log({
          user: userDoc.data,
          assignment: {
            ...assignmentDoc.data,
            scores: scoreData.scores,
          },
        });
        return {
          user: userDoc.data,
          assignment: {
            ...assignmentDoc.data,
            scores: scoreData.scores,
          },
        };
      });
    });
  } else {
    const requestBody = getAssignmentsRequestBody({
      adminId: adminId,
      orgType: orgType,
      orgId: orgId,
      aggregationQuery: false,
      pageLimit: pageLimit.value,
      page: page.value,
      paginate: paginate,
      select: select,
      filters: filters,
    });
    console.log(`Fetching page ${page.value} for ${adminId}`);
    return adminAxiosInstance.post(':runQuery', requestBody).then(async ({ data }) => {
      const assignmentData = mapFields(data);
      // Get User docs
      const userDocPaths = _without(
        data.map((adminDoc) => {
          if (adminDoc.document?.name) {
            return adminDoc.document.name.split('/assignments/')[0];
          } else {
            return undefined;
          }
        }),
        undefined,
      );

      // Use batchGet to get all user docs with one post request
      const batchUserDocs = await adminAxiosInstance
        .post(':batchGet', {
          documents: userDocPaths,
          mask: { fieldPaths: userSelectFields },
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

      const scoresObj = _zip(userDocData, assignmentData).map(([userData, assignmentData]) => ({
        assignment: assignmentData,
        user: userData,
      }));

      if (includeScores) {
        // Use batchGet to get all of the run docs (including their scores)
        const runDocPaths = _flatten(
          _zip(userDocPaths, assignmentData).map(([userPath, assignment]) => {
            const firestoreBasePath = 'https://firestore.googleapis.com/v1/';
            const adminBasePath = adminAxiosInstance.defaults.baseURL.replace(firestoreBasePath, '');
            const appBasePath = appAxiosInstance.defaults.baseURL.replace(firestoreBasePath, '');
            const runIds = _without(
              assignment.assessments.map((assessment) => assessment.runId),
              undefined,
            );
            return runIds.map((runId) => `${userPath.replace(adminBasePath, appBasePath)}/runs/${runId}`);
          }),
        );

        const batchRunDocs = await appAxiosInstance
          .post(':batchGet', {
            documents: runDocPaths,
            mask: { fieldPaths: ['scores'] },
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

        // Again the order of batchGet is not guaranteed. This time, we'd like to
        // group the runDocs by user's roarUid, in the same order as the userDocPaths
        const runs = _groupBy(batchRunDocs, (runDoc) => runDoc.name.split('/users/')[1].split('/runs/')[0]);

        for (const [index, userPath] of userDocPaths.entries()) {
          const roarUid = userPath.split('/users/')[1];
          const userRuns = runs[roarUid];
          for (const task of scoresObj[index].assignment.assessments) {
            const runId = task.runId;
            task['scores'] = _get(
              _find(userRuns, (runDoc) => runDoc.name.includes(runId)),
              'data.scores',
            );
          }
        }
      }

      return scoresObj;
    });
  }
};

export const getUserAssignments = async (roarUid) => {
  const adminAxiosInstance = getAxiosInstance();
  const assignmentRequest = getAssignmentsRequestBody({
    aggregationQuery: false,
    paginate: false,
    isCollectionGroupQuery: false,
  });
  return await adminAxiosInstance.post(`/users/${roarUid}:runQuery`, assignmentRequest).then(async ({ data }) => {
    const assignmentData = mapFields(data);
    const openAssignments = assignmentData.filter((assignment) => new Date(assignment.dateOpened) <= new Date());
    return openAssignments;
  });
};

export const assignmentFetchAll = async (adminId, orgType, orgId, includeScores = false) => {
  return await assignmentPageFetcher(
    adminId,
    orgType,
    orgId,
    { value: 2 ** 31 - 1 },
    { value: 0 },
    includeScores,
    true,
    true,
  );
};
