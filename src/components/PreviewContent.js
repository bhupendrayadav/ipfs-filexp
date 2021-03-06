import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {findKey, includes} from 'lodash-es'
import Highlight from 'react-syntax-highlighter'
import isBinary from 'is-binary'
import Video from 'react-html5video'
import {toastr} from 'react-redux-toastr'

// import 'react-html5video/dist/styles.css'

import languages from '../constants/languages'
// import shouldPureComponentUpdate from '../utils/pure'

const Loading = () => <div className='preview loading'>Loading</div>

function getExtension (name) {
  name = name.toLowerCase()

  const i = name.lastIndexOf('.')
  return name.substring(i + 1)
}

function getLanguage (name) {
  const ext = getExtension(name)
  const lang = findKey(languages, (l) => {
    return includes(l, ext)
  })

  if (lang) return lang
  return 'diff'
}

const renderers = {
  image (name, stats, gatewayUrl, read, content) {
    if (!content) {
      read(name)
      return <Loading />
    }

    const ext = getExtension(name)
    const blob = new window.Blob([content], {type: `image/${ext}`})
    const urlCreator = window.URL || window.webkitURL
    const imageUrl = urlCreator.createObjectURL(blob)

    return (
      <img alt={name} src={imageUrl} />
    )
  },

  video (name, stats, gatewayUrl, read, content) {
    if (gatewayUrl === false) {
      toastr.error('Video preview requires the gateway to be running. Please check your configuration.')
      return
    } else if (!gatewayUrl || !stats.Hash) {
      return <Loading />
    }

    const src = `${gatewayUrl}/ipfs/${stats.Hash}`
    const ext = getExtension(name)
    const type = `video/${ext}`
    return (
      <Video controls>
        <source src={src} type={type} />
      </Video>
    )
  },

  default (name, stats, gatewayUrl, read, content) {
    const cantPreview = (
      <div className='no-preview'>
        Sorry, we can not preview <code>{name}</code>.
      </div>
    )

    if (stats.size > 1024 * 1024 * 4) {
      return cantPreview
    }

    if (!content) {
      read(name)
      return <Loading />
    }

    if (isBinary(content.toString('utf8'))) {
      return cantPreview
    }

    return (
      <Highlight language={getLanguage(name)} stylesheet='github-gist'>
        {content.toString('utf8')}
      </Highlight>
    )
  }
}

const types = {
  image: ['jpg', 'jpeg', 'png', 'gif'],
  video: ['mp4', 'mov', 'avi']
}

function getType (ext) {
  const type = findKey(types, (t) => {
    return includes(t, ext)
  })

  if (type) return type
  return 'default'
}

function getRenderer (name) {
  const ext = getExtension(name)
  const type = getType(ext)

  return renderers[type]
}

function render (name, stats, gatewayUrl, read, content) {
  return getRenderer(name)(name, stats, gatewayUrl, function (name) {
    read(name)
  }, content)
}

export default class Preview extends Component {
  static propTypes = {
    name: PropTypes.string,
    stats: PropTypes.object,
    gatewayUrl: PropTypes.string,
    content: PropTypes.instanceOf(Buffer),
    read: PropTypes.func.isRequired
  };

  // shouldComponentUpdate = shouldPureComponentUpdate

  render () {
    return (
      <div className='preview'>
        {render(this.props.name, this.props.stats, this.props.gatewayUrl, this.props.read, this.props.content)}
      </div>
    )
  }
}
