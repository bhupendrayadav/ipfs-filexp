import React from 'react'
import {render} from 'react-dom'
import {Router, hashHistory} from 'react-router'
import {Provider} from 'react-redux'
import {syncHistoryWithStore} from 'react-router-redux'

import routes from './routes'
import configureStore from './configure-store'

const store = configureStore()
const history = syncHistoryWithStore(hashHistory, store)

render(
  <Provider store={store}>
    <Router history={history}>
      {routes}
    </Router>
  </Provider>,
  document.getElementById('root')
)
