import React from 'react'
import { RouteObject, useRoutes } from 'react-router-dom'

import LazyLoad from './util/lazyLoad'

const rootRouter: RouteObject[] = [
  {
    path: '/',
    element: LazyLoad(React.lazy(() => import('@/pages/board')))
  }
]

const Router = () => useRoutes(rootRouter)

export default Router
