import _fromPairs from "lodash/fromPairs";
import _find from "lodash/find";
import _get from "lodash/get";
import _head from "lodash/head";
import _isEmpty from "lodash/isEmpty";
import _last from "lodash/last";
import _mapValues from "lodash/mapValues";
import _toPairs from "lodash/toPairs";
import _union from "lodash/union";
import _without from "lodash/without";
import _zip from "lodash/zip";
import { convertValues, getAxiosInstance, mapFields, orderByDefault } from "./utils";
import { pluralizeFirestoreCollection } from "@/helpers";
import { getOrgsRequestBody } from "./orgs";
import { assign } from "lodash";
import { stringValue } from "vega";

export const getAssignmentsRequestBody = ({
  adminId,
  orgType,
  orgId,
  aggregationQuery,
  pageLimit,
  page,
  paginate = true,
  skinnyQuery = false,
}) => {
  const requestBody = {
    structuredQuery: {}
  };

  if(!aggregationQuery) {
    if(paginate) {
      requestBody.structuredQuery.limit = pageLimit;
      requestBody.structuredQuery.offset = page * pageLimit;
    }
    
    if(skinnyQuery) {
      requestBody.structuredQuery.select = {
        fields: [
          { fieldPath: "assessments" },
          { fieldPath: "started" },
          { fieldPath: "completed" },
        ]
      };
    } else {
      requestBody.structuredQuery.select = {
        fields: [
          { fieldPath: "assessments" },
          { fieldPath: "assigningOrgs" },
          { fieldPath: "completed" },
          { fieldPath: "dateAssigned" },
          { fieldPath: "dateClosed" },
          { fieldPath: "dateOpened" },
          { fieldPath: "started" },
          { fieldPath: "id" },
        ]
      };
    }
  }

  requestBody.structuredQuery.from = [
    {
      collectionId: "assignments",
      allDescendants: true,
    }
  ];

  requestBody.structuredQuery.where = {
    fieldFilter: {
      field: { fieldPath: "id" },
      op: "EQUAL",
      value: { stringValue: adminId }
    },
    fieldFilter: {
      field: { fieldPath: `assigningOrgs.${pluralizeFirestoreCollection(orgType)}` },
      op: "ARRAY_CONTAINS",
      value: { stringValue: orgId }
    }
  }

  if(aggregationQuery) {
    return {
      structuredAggregationQuery: {
        ...requestBody,
        aggregations: [{
          alias: "count",
          count: {},
        }]
      }
    }
  }

  return requestBody;
}

export const getScoresRequestBody = ({
  runIds,
  aggregationQuery,
  pageLimit,
  page,
  paginate = true,
  skinnyQuery = false,
}) => {
  const requestBody = {
    structuredQuery: {}
  };

  if(!aggregationQuery) {
    if(paginate) {
      requestBody.structuredQuery.limit = pageLimit;
      requestBody.structuredQuery.offset = page * pageLimit;
    }
    
    if(skinnyQuery) {
      requestBody.structuredQuery.select = {
        fields: [
          { fieldPath: "scores" },
        ]
      };
    } else {
      // TODO: fill this out
      requestBody.structuredQuery.select = {
        fields: [
          { fieldPath: "scores" },
        ]
      };
    }
  }

  requestBody.structuredQuery.from = [
    {
      collectionId: "runs",
      allDescendants: true,
    }
  ];

  requestBody.structuredQuery.where = {
    fieldFilter: {
      field: { fieldPath: "id" },
      op: "IN",
      value: {
        arrayValue: {
          values: [
            runIds.map(runId => {
              return { stringValue: runId }
            })
          ]
        }
      }
    }
  }

  if(aggregationQuery) {
    return {
      structuredAggregationQuery: {
        ...requestBody,
        aggregations: [{
          alias: "count",
          count: {},
        }]
      }
    }
  }

  return requestBody;
}

export const assignmentCounter = (adminId, orgType, orgId) => {
  const axiosInstance = getAxiosInstance();
  const requestBody = getAssignmentsRequestBody({
    adminId: adminId,
    orgType: orgType,
    orgId: orgId,
    aggregationQuery: true,
  })
  return axiosInstance.post(":runAggregationQuery", requestBody).then(({data}) => {
    return Number(convertValues(data[0].result?.aggregateFields?.count));
  })
}

export const scoresPageFetcher = async (adminId, orgType, orgId, pageLimit, page) => {
  const adminAxiosInstance = getAxiosInstance();
  const appAxiosInstance = getAxiosInstance('app');
  const requestBody = getAssignmentsRequestBody({
    adminId: adminId,
    orgType: orgType,
    orgId: orgId,
    aggregationQuery: false,
    pageLimit: pageLimit.value,
    page: page.value,
    paginate: true,
    skinnyQuery: false,
  })

  console.log(`Fetching page ${page.value} for ${adminId}`);
  return adminAxiosInstance.post(":runQuery", requestBody).then(async ({ data }) => {
    const assignmentData = mapFields(data)
    // Get User docs
    const userDocPaths = _without(data.map((adminDoc) => {
      if(adminDoc.document?.name){
        // Split the path, grab the userId
        const userId = adminDoc.document.name.split('/')[6]
        return `/users/${userId}/`;
      } else {
        return undefined
      }
    }), undefined)
    const userDocPromises = []
    for (const docPath of userDocPaths) {
      userDocPromises.push(adminAxiosInstance.get(docPath).then(({ data }) => {
        return _mapValues(data.fields, (value) => convertValues(value));
      }))
    }
    const userDocData = await Promise.all(userDocPromises);
    // Get scores docs
    const runIds = []
    for (const assignment of assignmentData) {
      for (const task of assignment.assessments) {
        if(task.runId) runIds.push(task.runId)
      }
    }
    const scoresRequestBody = getScoresRequestBody({
      runIds: runIds,
      aggregationQuery: false,
      pageLimit: pageLimit.value,
      page: page.value,
      paginate: false,
      skinnyQuery: false
    })
    const scoreData = await appAxiosInstance.post(":runQuery", scoresRequestBody).then(async ({ data }) => {
      return mapFields(data)
    })
    for (const assignment of assignmentData) {
      for (const task of assignment.assessments) {
        const runId = task.runId
        task['scores'] = _get(_find(scoreData, scoreDoc => scoreDoc.id === runId), 'scores')
      }
    }
    const scoresObj = _zip(userDocData, assignmentData).map(([userData, assignmentData]) => ({
        assignment: assignmentData,
        user: userData
    }))
    return scoresObj
  });
}