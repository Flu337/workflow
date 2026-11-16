declare global {
  const ALLOWED_STATUS_TRANSITIONS: typeof import('../../shared/utils/statusTransitions').ALLOWED_STATUS_TRANSITIONS
  const FAQ_ITEMS: typeof import('../../shared/utils/publicContent').FAQ_ITEMS
  const H3Error: typeof import('../../node_modules/h3/dist/index').H3Error
  const H3Event: typeof import('../../node_modules/h3/dist/index').H3Event
  const KNOWLEDGE_ARTICLES: typeof import('../../shared/utils/publicContent').KNOWLEDGE_ARTICLES
  const KNOWLEDGE_CATEGORIES: typeof import('../../shared/utils/publicContent').KNOWLEDGE_CATEGORIES
  const POSTGRES_SCHEMA_SQL: typeof import('../../server/utils/postgresSchema').POSTGRES_SCHEMA_SQL
  const PRIORITY_DUE_DATES: typeof import('../../shared/types/workflow').PRIORITY_DUE_DATES
  const PRIORITY_LABELS: typeof import('../../shared/types/workflow').PRIORITY_LABELS
  const ROLE_ALLOWED_TARGET_STATUSES: typeof import('../../shared/utils/statusTransitions').ROLE_ALLOWED_TARGET_STATUSES
  const ROLE_LABELS: typeof import('../../shared/types/workflow').ROLE_LABELS
  const SERVER_CATEGORIES_DB: typeof import('../../server/utils/db').SERVER_CATEGORIES_DB
  const SERVER_CUSTOMERS_DB: typeof import('../../server/utils/db').SERVER_CUSTOMERS_DB
  const SERVER_REQUESTS_DB: typeof import('../../server/utils/db').SERVER_REQUESTS_DB
  const SERVER_USERS_DB: typeof import('../../server/utils/db').SERVER_USERS_DB
  const STATUS_LABELS: typeof import('../../shared/types/workflow').STATUS_LABELS
  const __buildAssetsURL: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/paths').buildAssetsURL
  const __publicAssetsURL: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/paths').publicAssetsURL
  const addCommentInputSchema: typeof import('../../shared/utils/validation').addCommentInputSchema
  const appendCorsHeaders: typeof import('../../node_modules/h3/dist/index').appendCorsHeaders
  const appendCorsPreflightHeaders: typeof import('../../node_modules/h3/dist/index').appendCorsPreflightHeaders
  const appendHeader: typeof import('../../node_modules/h3/dist/index').appendHeader
  const appendHeaders: typeof import('../../node_modules/h3/dist/index').appendHeaders
  const appendResponseHeader: typeof import('../../node_modules/h3/dist/index').appendResponseHeader
  const appendResponseHeaders: typeof import('../../node_modules/h3/dist/index').appendResponseHeaders
  const assertMethod: typeof import('../../node_modules/h3/dist/index').assertMethod
  const cachedEventHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').cachedEventHandler
  const cachedFunction: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').cachedFunction
  const callNodeListener: typeof import('../../node_modules/h3/dist/index').callNodeListener
  const canUserAccessDashboard: typeof import('../../shared/utils/permissions').canUserAccessDashboard
  const canUserAccessRequest: typeof import('../../shared/utils/permissions').canUserAccessRequest
  const canUserAssignExecutor: typeof import('../../shared/utils/permissions').canUserAssignExecutor
  const canUserChangePriority: typeof import('../../shared/utils/permissions').canUserChangePriority
  const canUserCloseRequest: typeof import('../../shared/utils/permissions').canUserCloseRequest
  const canUserCreateRequest: typeof import('../../shared/utils/permissions').canUserCreateRequest
  const canUserResolveRequest: typeof import('../../shared/utils/permissions').canUserResolveRequest
  const clearResponseHeaders: typeof import('../../node_modules/h3/dist/index').clearResponseHeaders
  const clearServerSession: typeof import('../../server/utils/auth').clearServerSession
  const clearSession: typeof import('../../node_modules/h3/dist/index').clearSession
  const createApp: typeof import('../../node_modules/h3/dist/index').createApp
  const createAppEventHandler: typeof import('../../node_modules/h3/dist/index').createAppEventHandler
  const createError: typeof import('../../node_modules/h3/dist/index').createError
  const createEvent: typeof import('../../node_modules/h3/dist/index').createEvent
  const createEventStream: typeof import('../../node_modules/h3/dist/index').createEventStream
  const createRequestInputSchema: typeof import('../../shared/utils/validation').createRequestInputSchema
  const createRouter: typeof import('../../node_modules/h3/dist/index').createRouter
  const createSearchRaceGuard: typeof import('../../shared/utils/asyncGuards').createSearchRaceGuard
  const createServerSession: typeof import('../../server/utils/auth').createServerSession
  const createSubmissionLock: typeof import('../../shared/utils/asyncGuards').createSubmissionLock
  const defaultContentType: typeof import('../../node_modules/h3/dist/index').defaultContentType
  const defineAppConfig: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/config').defineAppConfig
  const defineCachedEventHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').defineCachedEventHandler
  const defineCachedFunction: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').defineCachedFunction
  const defineEventHandler: typeof import('../../node_modules/h3/dist/index').defineEventHandler
  const defineLazyEventHandler: typeof import('../../node_modules/h3/dist/index').defineLazyEventHandler
  const defineNitroErrorHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/error/utils').defineNitroErrorHandler
  const defineNitroPlugin: typeof import('../../node_modules/nitropack/dist/runtime/internal/plugin').defineNitroPlugin
  const defineNodeListener: typeof import('../../node_modules/h3/dist/index').defineNodeListener
  const defineNodeMiddleware: typeof import('../../node_modules/h3/dist/index').defineNodeMiddleware
  const defineRenderHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/renderer').defineRenderHandler
  const defineRequestMiddleware: typeof import('../../node_modules/h3/dist/index').defineRequestMiddleware
  const defineResponseMiddleware: typeof import('../../node_modules/h3/dist/index').defineResponseMiddleware
  const defineRouteMeta: typeof import('../../node_modules/nitropack/dist/runtime/internal/meta').defineRouteMeta
  const defineTask: typeof import('../../node_modules/nitropack/dist/runtime/internal/task').defineTask
  const defineWebSocket: typeof import('../../node_modules/h3/dist/index').defineWebSocket
  const defineWebSocketHandler: typeof import('../../node_modules/h3/dist/index').defineWebSocketHandler
  const deleteCookie: typeof import('../../node_modules/h3/dist/index').deleteCookie
  const dynamicEventHandler: typeof import('../../node_modules/h3/dist/index').dynamicEventHandler
  const eventHandler: typeof import('../../node_modules/h3/dist/index').eventHandler
  const fetchWithEvent: typeof import('../../node_modules/h3/dist/index').fetchWithEvent
  const filterFaqItems: typeof import('../../shared/utils/publicContent').filterFaqItems
  const filterKnowledgeArticles: typeof import('../../shared/utils/publicContent').filterKnowledgeArticles
  const findKnowledgeArticleBySlug: typeof import('../../shared/utils/publicContent').findKnowledgeArticleBySlug
  const fromNodeMiddleware: typeof import('../../node_modules/h3/dist/index').fromNodeMiddleware
  const fromPlainHandler: typeof import('../../node_modules/h3/dist/index').fromPlainHandler
  const fromWebHandler: typeof import('../../node_modules/h3/dist/index').fromWebHandler
  const getAllowedNextStatuses: typeof import('../../shared/utils/statusTransitions').getAllowedNextStatuses
  const getCookie: typeof import('../../node_modules/h3/dist/index').getCookie
  const getHeader: typeof import('../../node_modules/h3/dist/index').getHeader
  const getHeaders: typeof import('../../node_modules/h3/dist/index').getHeaders
  const getMethod: typeof import('../../node_modules/h3/dist/index').getMethod
  const getPostgresConfig: typeof import('../../server/utils/postgresSchema').getPostgresConfig
  const getProxyRequestHeaders: typeof import('../../node_modules/h3/dist/index').getProxyRequestHeaders
  const getQuery: typeof import('../../node_modules/h3/dist/index').getQuery
  const getRequestFingerprint: typeof import('../../node_modules/h3/dist/index').getRequestFingerprint
  const getRequestHeader: typeof import('../../node_modules/h3/dist/index').getRequestHeader
  const getRequestHeaders: typeof import('../../node_modules/h3/dist/index').getRequestHeaders
  const getRequestHost: typeof import('../../node_modules/h3/dist/index').getRequestHost
  const getRequestIP: typeof import('../../node_modules/h3/dist/index').getRequestIP
  const getRequestPath: typeof import('../../node_modules/h3/dist/index').getRequestPath
  const getRequestProtocol: typeof import('../../node_modules/h3/dist/index').getRequestProtocol
  const getRequestURL: typeof import('../../node_modules/h3/dist/index').getRequestURL
  const getRequestWebStream: typeof import('../../node_modules/h3/dist/index').getRequestWebStream
  const getResponseHeader: typeof import('../../node_modules/h3/dist/index').getResponseHeader
  const getResponseHeaders: typeof import('../../node_modules/h3/dist/index').getResponseHeaders
  const getResponseStatus: typeof import('../../node_modules/h3/dist/index').getResponseStatus
  const getResponseStatusText: typeof import('../../node_modules/h3/dist/index').getResponseStatusText
  const getRouteRules: typeof import('../../node_modules/nitropack/dist/runtime/internal/route-rules').getRouteRules
  const getRouterParam: typeof import('../../node_modules/h3/dist/index').getRouterParam
  const getRouterParams: typeof import('../../node_modules/h3/dist/index').getRouterParams
  const getSession: typeof import('../../node_modules/h3/dist/index').getSession
  const getValidatedQuery: typeof import('../../node_modules/h3/dist/index').getValidatedQuery
  const getValidatedRouterParams: typeof import('../../node_modules/h3/dist/index').getValidatedRouterParams
  const handleCacheHeaders: typeof import('../../node_modules/h3/dist/index').handleCacheHeaders
  const handleCors: typeof import('../../node_modules/h3/dist/index').handleCors
  const isCorsOriginAllowed: typeof import('../../node_modules/h3/dist/index').isCorsOriginAllowed
  const isDuplicateCommentKey: typeof import('../../server/utils/auth').isDuplicateCommentKey
  const isError: typeof import('../../node_modules/h3/dist/index').isError
  const isEvent: typeof import('../../node_modules/h3/dist/index').isEvent
  const isEventHandler: typeof import('../../node_modules/h3/dist/index').isEventHandler
  const isMethod: typeof import('../../node_modules/h3/dist/index').isMethod
  const isPreflightRequest: typeof import('../../node_modules/h3/dist/index').isPreflightRequest
  const isStream: typeof import('../../node_modules/h3/dist/index').isStream
  const isWebResponse: typeof import('../../node_modules/h3/dist/index').isWebResponse
  const lazyEventHandler: typeof import('../../node_modules/h3/dist/index').lazyEventHandler
  const loginInputSchema: typeof import('../../shared/utils/validation').loginInputSchema
  const nitroPlugin: typeof import('../../node_modules/nitropack/dist/runtime/internal/plugin').nitroPlugin
  const parseCookies: typeof import('../../node_modules/h3/dist/index').parseCookies
  const promisifyNodeListener: typeof import('../../node_modules/h3/dist/index').promisifyNodeListener
  const proxyRequest: typeof import('../../node_modules/h3/dist/index').proxyRequest
  const readBody: typeof import('../../node_modules/h3/dist/index').readBody
  const readFormData: typeof import('../../node_modules/h3/dist/index').readFormData
  const readMultipartFormData: typeof import('../../node_modules/h3/dist/index').readMultipartFormData
  const readRawBody: typeof import('../../node_modules/h3/dist/index').readRawBody
  const readValidatedBody: typeof import('../../node_modules/h3/dist/index').readValidatedBody
  const registerCommentKey: typeof import('../../server/utils/auth').registerCommentKey
  const registerInputSchema: typeof import('../../shared/utils/validation').registerInputSchema
  const removeResponseHeader: typeof import('../../node_modules/h3/dist/index').removeResponseHeader
  const requireAuthUser: typeof import('../../server/utils/auth').requireAuthUser
  const requireRoles: typeof import('../../server/utils/auth').requireRoles
  const resolveSessionFromEvent: typeof import('../../server/utils/auth').resolveSessionFromEvent
  const runTask: typeof import('../../node_modules/nitropack/dist/runtime/internal/task').runTask
  const sanitizeStatusCode: typeof import('../../node_modules/h3/dist/index').sanitizeStatusCode
  const sanitizeStatusMessage: typeof import('../../node_modules/h3/dist/index').sanitizeStatusMessage
  const sealSession: typeof import('../../node_modules/h3/dist/index').sealSession
  const send: typeof import('../../node_modules/h3/dist/index').send
  const sendError: typeof import('../../node_modules/h3/dist/index').sendError
  const sendIterable: typeof import('../../node_modules/h3/dist/index').sendIterable
  const sendNoContent: typeof import('../../node_modules/h3/dist/index').sendNoContent
  const sendProxy: typeof import('../../node_modules/h3/dist/index').sendProxy
  const sendRedirect: typeof import('../../node_modules/h3/dist/index').sendRedirect
  const sendStream: typeof import('../../node_modules/h3/dist/index').sendStream
  const sendWebResponse: typeof import('../../node_modules/h3/dist/index').sendWebResponse
  const serveStatic: typeof import('../../node_modules/h3/dist/index').serveStatic
  const setCookie: typeof import('../../node_modules/h3/dist/index').setCookie
  const setHeader: typeof import('../../node_modules/h3/dist/index').setHeader
  const setHeaders: typeof import('../../node_modules/h3/dist/index').setHeaders
  const setResponseHeader: typeof import('../../node_modules/h3/dist/index').setResponseHeader
  const setResponseHeaders: typeof import('../../node_modules/h3/dist/index').setResponseHeaders
  const setResponseStatus: typeof import('../../node_modules/h3/dist/index').setResponseStatus
  const splitCookiesString: typeof import('../../node_modules/h3/dist/index').splitCookiesString
  const toEventHandler: typeof import('../../node_modules/h3/dist/index').toEventHandler
  const toNodeListener: typeof import('../../node_modules/h3/dist/index').toNodeListener
  const toPlainHandler: typeof import('../../node_modules/h3/dist/index').toPlainHandler
  const toSessionUserDto: typeof import('../../server/utils/auth').toSessionUserDto
  const toWebHandler: typeof import('../../node_modules/h3/dist/index').toWebHandler
  const toWebRequest: typeof import('../../node_modules/h3/dist/index').toWebRequest
  const unsealSession: typeof import('../../node_modules/h3/dist/index').unsealSession
  const updateRequestInputSchema: typeof import('../../shared/utils/validation').updateRequestInputSchema
  const updateSession: typeof import('../../node_modules/h3/dist/index').updateSession
  const useAppConfig: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/app-config').useAppConfig
  const useBase: typeof import('../../node_modules/h3/dist/index').useBase
  const useEvent: typeof import('../../node_modules/nitropack/dist/runtime/internal/context').useEvent
  const useNitroApp: typeof import('../../node_modules/nitropack/dist/runtime/internal/app').useNitroApp
  const useRuntimeConfig: typeof import('../../node_modules/nitropack/dist/runtime/internal/config').useRuntimeConfig
  const useSession: typeof import('../../node_modules/h3/dist/index').useSession
  const useStorage: typeof import('../../node_modules/nitropack/dist/runtime/internal/storage').useStorage
  const validateStatusTransition: typeof import('../../shared/utils/statusTransitions').validateStatusTransition
  const writeEarlyHints: typeof import('../../node_modules/h3/dist/index').writeEarlyHints
}
// for type re-export
declare global {
  // @ts-ignore
  export type { EventHandler, EventHandlerRequest, EventHandlerResponse, EventHandlerObject, H3EventContext } from '../../node_modules/h3/dist/index'
  import('../../node_modules/h3/dist/index')
  // @ts-ignore
  export type { SearchRaceGuard, SubmissionLock } from '../../shared/utils/asyncGuards'
  import('../../shared/utils/asyncGuards')
  // @ts-ignore
  export type { KnowledgeSection, KnowledgeArticle, KnowledgeCategory, FaqQuestionItem } from '../../shared/utils/publicContent'
  import('../../shared/utils/publicContent')
  // @ts-ignore
  export type { StatusTransitionValidationInput, StatusTransitionValidationResult } from '../../shared/utils/statusTransitions'
  import('../../shared/utils/statusTransitions')
  // @ts-ignore
  export type { ValidationIssue, SafeParseResult, SchemaValidator } from '../../shared/utils/validation'
  import('../../shared/utils/validation')
  // @ts-ignore
  export type { UserRole, RequestStatus, RequestPriority, RequestSortOrder, SortOrder, ListViewState, ListDensity, RequestCommentDto, RequestTimelineItemDto, RequestAttachmentDto, RequestItemDto, RequestsMetricsDto, RequestsListResponseDto, RequestDetailResponseDto, UserDirectoryItemDto, CustomerDirectoryItemDto, CategoryDirectoryItemDto, SessionUserDto, AuthSessionResponseDto, LoginPayloadDto, RegisterPayloadDto, RequestComment, RequestTimelineItem, WorkFlowRequest, NormalizedRequestsListResult, RequestsFilterQuery, UpdateRequestPayloadDto, UpdateRequestResponseDto, AddCommentPayloadDto, AddCommentResponseDto, CreateRequestPayloadDto, UndoMutationSnapshot, RollbackBannerState, FeedbackBannerState, UserPreferencesState } from '../../shared/types/workflow'
  import('../../shared/types/workflow')
  // @ts-ignore
  export type { ServerUserRecord } from '../../server/utils/db'
  import('../../server/utils/db')
  // @ts-ignore
  export type { PostgresConnectionConfig } from '../../server/utils/postgresSchema'
  import('../../server/utils/postgresSchema')
}
export { H3Event, H3Error, appendCorsHeaders, appendCorsPreflightHeaders, appendHeader, appendHeaders, appendResponseHeader, appendResponseHeaders, assertMethod, callNodeListener, clearResponseHeaders, clearSession, createApp, createAppEventHandler, createError, createEvent, createEventStream, createRouter, defaultContentType, defineEventHandler, defineLazyEventHandler, defineNodeListener, defineNodeMiddleware, defineRequestMiddleware, defineResponseMiddleware, defineWebSocket, defineWebSocketHandler, deleteCookie, dynamicEventHandler, eventHandler, fetchWithEvent, fromNodeMiddleware, fromPlainHandler, fromWebHandler, getCookie, getHeader, getHeaders, getMethod, getProxyRequestHeaders, getQuery, getRequestFingerprint, getRequestHeader, getRequestHeaders, getRequestHost, getRequestIP, getRequestPath, getRequestProtocol, getRequestURL, getRequestWebStream, getResponseHeader, getResponseHeaders, getResponseStatus, getResponseStatusText, getRouterParam, getRouterParams, getSession, getValidatedQuery, getValidatedRouterParams, handleCacheHeaders, handleCors, isCorsOriginAllowed, isError, isEvent, isEventHandler, isMethod, isPreflightRequest, isStream, isWebResponse, lazyEventHandler, parseCookies, promisifyNodeListener, proxyRequest, readBody, readFormData, readMultipartFormData, readRawBody, readValidatedBody, removeResponseHeader, sanitizeStatusCode, sanitizeStatusMessage, sealSession, send, sendError, sendIterable, sendNoContent, sendProxy, sendRedirect, sendStream, sendWebResponse, serveStatic, setCookie, setHeader, setHeaders, setResponseHeader, setResponseHeaders, setResponseStatus, splitCookiesString, toEventHandler, toNodeListener, toPlainHandler, toWebHandler, toWebRequest, unsealSession, updateSession, useBase, useSession, writeEarlyHints } from 'h3';
export { useNitroApp } from 'nitropack/runtime/internal/app';
export { useRuntimeConfig } from 'nitropack/runtime/internal/config';
export { defineNitroPlugin, nitroPlugin } from 'nitropack/runtime/internal/plugin';
export { defineCachedFunction, defineCachedEventHandler, cachedFunction, cachedEventHandler } from 'nitropack/runtime/internal/cache';
export { useStorage } from 'nitropack/runtime/internal/storage';
export { defineRenderHandler } from 'nitropack/runtime/internal/renderer';
export { defineRouteMeta } from 'nitropack/runtime/internal/meta';
export { getRouteRules } from 'nitropack/runtime/internal/route-rules';
export { useEvent } from 'nitropack/runtime/internal/context';
export { defineTask, runTask } from 'nitropack/runtime/internal/task';
export { defineNitroErrorHandler } from 'nitropack/runtime/internal/error/utils';
export { buildAssetsURL as __buildAssetsURL, publicAssetsURL as __publicAssetsURL } from 'C:/Users/5LU/Desktop/workflow-nuxt4/node_modules/@nuxt/nitro-server/dist/runtime/utils/paths';
export { defineAppConfig } from 'C:/Users/5LU/Desktop/workflow-nuxt4/node_modules/@nuxt/nitro-server/dist/runtime/utils/config';
export { useAppConfig } from 'C:/Users/5LU/Desktop/workflow-nuxt4/node_modules/@nuxt/nitro-server/dist/runtime/utils/app-config';
export { createSearchRaceGuard, createSubmissionLock } from 'C:/Users/5LU/Desktop/workflow-nuxt4/shared/utils/asyncGuards';
export { canUserAccessRequest, canUserAssignExecutor, canUserChangePriority, canUserCloseRequest, canUserResolveRequest, canUserCreateRequest, canUserAccessDashboard } from 'C:/Users/5LU/Desktop/workflow-nuxt4/shared/utils/permissions';
export { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ARTICLES, FAQ_ITEMS, findKnowledgeArticleBySlug, filterKnowledgeArticles, filterFaqItems } from 'C:/Users/5LU/Desktop/workflow-nuxt4/shared/utils/publicContent';
export { ALLOWED_STATUS_TRANSITIONS, ROLE_ALLOWED_TARGET_STATUSES, getAllowedNextStatuses, validateStatusTransition } from 'C:/Users/5LU/Desktop/workflow-nuxt4/shared/utils/statusTransitions';
export { loginInputSchema, registerInputSchema, createRequestInputSchema, updateRequestInputSchema, addCommentInputSchema } from 'C:/Users/5LU/Desktop/workflow-nuxt4/shared/utils/validation';
export { ROLE_LABELS, STATUS_LABELS, PRIORITY_LABELS, PRIORITY_DUE_DATES } from 'C:/Users/5LU/Desktop/workflow-nuxt4/shared/types/workflow';
export { isDuplicateCommentKey, registerCommentKey, toSessionUserDto, createServerSession, clearServerSession, resolveSessionFromEvent, requireAuthUser, requireRoles } from 'C:/Users/5LU/Desktop/workflow-nuxt4/server/utils/auth';
export { SERVER_REQUESTS_DB, SERVER_USERS_DB, SERVER_CUSTOMERS_DB, SERVER_CATEGORIES_DB } from 'C:/Users/5LU/Desktop/workflow-nuxt4/server/utils/db';
export { POSTGRES_SCHEMA_SQL, getPostgresConfig } from 'C:/Users/5LU/Desktop/workflow-nuxt4/server/utils/postgresSchema';