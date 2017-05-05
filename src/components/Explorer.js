import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'
import {join} from 'path'
import {includes} from 'lodash-es'
import {toastr} from 'react-redux-toastr'

// import {files, router} from '../actions'
import {files} from '../actions'

import Tree from './Tree'
import ActionBar from './ActionBar'
import Breadcrumbs from './Breadcrumbs'

class Explorer extends Component {
  static propTypes = {
    // state
    list: PropTypes.array.isRequired,
    root: PropTypes.string.isRequired,
    tmpDir: PropTypes.shape({
      root: PropTypes.string.isRequired,
      name: PropTypes.string
    }),
    selected: PropTypes.array.isRequired,
    // actions
    load: PropTypes.func.isRequired,
    leave: PropTypes.func.isRequired,
    setRoot: PropTypes.func.isRequired,
    createTmpDir: PropTypes.func.isRequired,
    setTmpDirName: PropTypes.func.isRequired,
    createDir: PropTypes.func.isRequired,
    removeDir: PropTypes.func.isRequired,
    rmTmpDir: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
    deselect: PropTypes.func.isRequired,
    deselectAll: PropTypes.func.isRequired,
    createFiles: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired
  };

  componentWillMount () {
    this.props.load()
  }

  componentWillUnmount () {
    this.props.leave()
  }

  _onRowClick = (file, shiftKey) => {
    const {
      root,
      selected,
      select,
      deselect,
      deselectAll
    } = this.props
    const filePath = join(root, file.Name)
    const currentlySelected = includes(selected, filePath)

    if (currentlySelected) {
      deselect(filePath)
    } else if (shiftKey && !currentlySelected) {
      select(filePath)
    } else {
      deselectAll()
      select(filePath)
    }
  };

  _onRowContextMenu = (file, shiftKey) => {
    const {
      root,
      selected,
      select,
      deselectAll
    } = this.props
    const filePath = join(root, file.Name)
    const currentlySelected = includes(selected, filePath)

    if (shiftKey) {
      select(filePath)
    } else {
      if (!currentlySelected) {
        deselectAll()
      }
      select(filePath)
    }
  };

  _onRowDoubleClick = (file, shiftKey) => {
    const {root, deselectAll, setRoot, push} = this.props
    const filePath = join(root, file.Name)
    deselectAll()
    if (file.Type === 'directory') {
      setRoot(filePath)
    } else {
      push({
        pathname: '/files/preview',
        query: {
          name: filePath
        }
      })
    }
  };

  _onCreateDir = (event) => {
    this.props.createTmpDir(this.props.root)
  };

  _onCreateFiles = (files) => {
    this.props.createFiles(this.props.root, files)
  };

  _onCancelCreateDir = (event) => {
    this.props.rmTmpDir()
  };

  _onRemoveDir = () => {
    const {selected, removeDir} = this.props
    const count = selected.length
    const plural = count > 1 ? 'files' : 'file'
    const msg = `Are you sure you want to delete ${count} ${plural}?`
    toastr.confirm(msg, {
      onOk () {
        removeDir()
      }
    })
  };

  render () {
    const {list, root, setRoot, tmpDir, selected} = this.props

    return (
      <div className='files-explorer'>
        <Row>
          <Col sm={12}>
            <Row>
              <Col sm={12}>
                <Breadcrumbs
                  files={list}
                  root={root}
                  setRoot={setRoot}
                />
                <ActionBar
                  selectedFiles={selected}
                  onCreateDir={this._onCreateDir}
                  onRemoveDir={this._onRemoveDir} />
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Tree
                  files={list}
                  tmpDir={tmpDir}
                  root={root}
                  selectedFiles={selected}
                  onRowClick={this._onRowClick}
                  onRowContextMenu={this._onRowContextMenu}
                  onRowDoubleClick={this._onRowDoubleClick}
                  onTmpDirChange={this.props.setTmpDirName}
                  onCreateDir={this.props.createDir}
                  onCancelCreateDir={this._onCancelCreateDir}
                  onCreateFiles={this._onCreateFiles}
                  onRemoveDir={this._onRemoveDir} />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProps (state) {
  const {files} = state
  return files
}

export default connect(mapStateToProps, {
  load: files.load,
  leave: files.leave,
  setRoot: files.setRoot,
  createTmpDir: files.createTmpDir,
  setTmpDirName: files.setTmpDirName,
  createDir: files.createDir,
  removeDir: files.removeDir,
  rmTmpDir: files.rmTmpDir,
  select: files.select,
  deselect: files.deselect,
  deselectAll: files.deselectAll,
  createFiles: files.createFiles
  // push: router.push
})(Explorer)
