import React, { useMemo, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { CANVAS_ELE_TYPE, CommonWidth } from '@/utils/constants'
import { PaintBoard } from '@/utils/paintBoard'
import { FreeDrawStyle } from '@/utils/element/freeDraw'
import Layer from '../layer'
import { CHANGE_COLOR_TYPE, styleSwitch, typeSwitch } from './constant'
import UndoIcon from '@/components/icons/undo'
import RedoIcon from '@/components/icons/redo'
import SaveIcon from '@/components/icons/save'
import CleanIcon from '@/components/icons/clean'
import CloseIcon from '../icons/close'
import MenuIcon from '../icons/menu'

import styles from './index.module.css'
import fs from 'fs'

// import body from 'koa-body'
// import koastatic from 'koa-static'
// import { resolve } from 'path'


interface IProps {
  board: PaintBoard | undefined // 画板
  toolType: string // 操作类型
  setToolType: (type: string) => void // 修改操作类型
}

let toastTimeout: NodeJS.Timeout | null = null

/**
 * 操作面板
 */
const ToolPanel: React.FC<IProps> = ({ board, toolType, setToolType }) => {
  const { t } = useTranslation()
  const [, setRefresh] = useState(0) // 刷新数据
  const [toastState, setToastState] = useState(false) // 复制提示
  const [showPanel, setShowPanel] = useState(true) // 面板展示控制
  // 颜色输入框(目前是只读数据)
  const colorInput = useMemo(() => {
    if (board?.currentLineColor) {
      return board.currentLineColor[0].split('#')[1] || ''
    }
    return ''
  }, [board?.currentLineColor])

  // 改变画笔颜色
  const changeLineColor = (color: string, index: number, type: string) => {
    if (board) {
      const colors = [...board.currentLineColor]
      colors[index] = color
      const newColor = type === CHANGE_COLOR_TYPE.UNI ? [color] : colors
      board.setFreeDrawColor(newColor)
      setRefresh((v) => v + 1)
    }
  }

  // 删除画笔颜色
  const deleteLineColor = (index: number) => {
    if (board) {
      const colors = [...board.currentLineColor]
      colors.splice(index, 1)
      board.setFreeDrawColor(colors)
      setRefresh((v) => v + 1)
    }
  }

  // 复制颜色
  const copyColor = () => {
    const inputElement = document.querySelector(
      '#colorInput'
    ) as HTMLInputElement
    inputElement.select()
    document.execCommand('copy')
    setToastState(true)
    if (toastTimeout) {
      clearTimeout(toastTimeout)
    }
    toastTimeout = setTimeout(() => {
      setToastState(false)
    }, 2000)
  }

  // 点击后退
  const undo = () => {
    if (board) {
      board.undo()
    }
  }

  // 点击前进
  const redo = () => {
    if (board) {
      board.redo()
    }
  }

  // 清除画布
  const clean = () => {
    if (board) {
      board.clean()
    }
  }

  // 保存图片
  const saveImage = () => {
    if (board) {
      board.saveImage()
    }
  }

  // 改变宽度
  const setWidth = (w: number) => {
    if (board) {
      switch (toolType) {
        case CANVAS_ELE_TYPE.FREE_DRAW:
          board.setFreeDrawWidth(w)
          break
        case CANVAS_ELE_TYPE.ERASER:
          board.setCleanWidth(w)
          break
        default:
          break
      }
      setRefresh((v) => v + 1)
    }
  }

  // 改变画笔样式
  const setFreeDrawStyle = (mode: FreeDrawStyle) => {
    if (board) {
      board.setFreeDrawStyle(mode)
      setRefresh((v) => v + 1)
    }
  }

  // Call image upload
  function uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileUpload;
  
    input.click();
  }
  
  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    const formData = new FormData();
    formData.append('file', file);

    // 发送 AJAX 请求
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:9876/upload', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log('File uploaded successfully!');
        } else {
          console.error('Failed to upload file:', xhr.statusText);
        }
      }
    };
    xhr.send(formData);

    
    // console.log(file?.toString());
    // if (file) {
    //   const formData = new FormData();
    //   formData.append('image', file);
  
    //   fetch('http://127.0.0.1:9876/upload', {
    //     method: 'POST',
    //     body: formData,
    //   })
    //     .then((response) => response.json())
    //     .then((data) => {
    //       if (data.success) {
    //         console.log('上传成功:', data.message);
    //       } else {
    //         console.error('上传失败:', data.message);
    //       }
    //     })
    //     .catch((error) => {
    //       console.error('上传失败:', error);
    //     });
    // }
  }

  // Upload image.
  type filesitemtype = {
    filepath: string,
    size: number,
    mimetype: string,
    newFilename: string,
    originalFilename: string
    url:string
  }
  type filestype = {
      url: string,
      size: number,
      mimetype: string,
      newFilename: string,
      originalFilename: string
  }


  return (
    <>
      <div
        className={`fixed top-5 left-5 flex flex-col card shadow-xl overflow-visible ${
          showPanel ? 'p-5' : ''
        }`}
        style={{ backgroundColor: '#EEF1FF' }}
      >
        {/* 控制面板显示 */}
        <label className="btn btn-circle swap swap-rotate absolute -top-4 -left-4 h-8 w-8 min-h-0">
          <input type="checkbox" onChange={() => setShowPanel((v) => !v)} />
          <CloseIcon className="swap-on fill-current" />
          <MenuIcon className="swap-off fill-current" />
        </label>
        {showPanel && (
          <>
            {/* 类型切换 */}
            <div className="btn-group flex">
              {typeSwitch.map(({ type, text }) => (
                <button
                  key={type}
                  className={`btn btn-sm flex-grow ${
                    toolType === type ? 'btn-active' : ''
                  }`}
                  onClick={() => setToolType(type)}
                >
                  {t(text)}
                </button>
              ))}
            </div>
            {/* 宽度设置 */}
            {(toolType === CANVAS_ELE_TYPE.FREE_DRAW ||
              toolType === CANVAS_ELE_TYPE.ERASER) && (
              <div className="mt-3">
                <div className="font-bold">Width</div>
                <div className="btn-group flex mt-1">
                  {Object.values(CommonWidth).map((w) => (
                    <button
                      key={w}
                      className={classNames({
                        btn: true,
                        'btn-sm': true,
                        'flex-grow': true,
                        'btn-active':
                          toolType === CANVAS_ELE_TYPE.FREE_DRAW
                            ? board?.currentLineWidth === w
                            : board?.cleanWidth === w
                      })}
                      onClick={() => setWidth(w)}
                    >
                      <div
                        className="rounded-2xl bg-black"
                        style={{
                          height: `${w / 2}px`,
                          width: '30px'
                        }}
                        key={w}
                      ></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* 颜色设置 */}
            {toolType === CANVAS_ELE_TYPE.FREE_DRAW && (
              <div className="form-control mt-3">
                <div className="font-bold">Color</div>
                <div className="mt-1 flex items-center w-full">
                  {board?.currentFreeDrawStyle === FreeDrawStyle.MultiColor ? (
                    // 多色配置
                    <>
                      {board.currentLineColor.map((color, i) => {
                        return (
                          <div className="w-8 h-8 mr-2 indicator" key={i}>
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => {
                                changeLineColor(e.target.value, i, 'double')
                              }}
                              className={styles.lineColor}
                            />
                            {board.currentLineColor.length > 1 && (
                              <span
                                onClick={() => deleteLineColor(i)}
                                className="indicator-item badge badge-secondary w-3 h-3 p-0 text-sm bg-black text-white border-black cursor-pointer block text-center"
                                style={{ lineHeight: '0.5rem' }}
                              >
                                x
                              </span>
                            )}
                          </div>
                        )
                      })}
                      {board.currentLineColor.length < 6 && (
                        <div
                          className="w-8 h-8 rounded-sm border-dashed border-2 border-black text-center leading-6 text-2xl box-border cursor-pointer"
                          onClick={() => {
                            changeLineColor(
                              '#000000',
                              board.currentLineColor.length,
                              CHANGE_COLOR_TYPE.MULTI
                            )
                          }}
                        >
                          +
                        </div>
                      )}
                    </>
                  ) : (
                    // 单色配置
                    <>
                      <div className="w-8 h-8 mr-2">
                        <input
                          type="color"
                          value={`#${colorInput}`}
                          onChange={(e) => {
                            changeLineColor(
                              e.target.value,
                              1,
                              CHANGE_COLOR_TYPE.UNI
                            )
                          }}
                          className={styles.lineColor}
                        />
                      </div>
                      <label className="input-group">
                        <span className="font-bold bg-primary">#</span>
                        <input
                          onClick={copyColor}
                          value={colorInput}
                          id="colorInput"
                          className="input input-bordered input-sm w-32 focus:outline-none cursor-pointer"
                          readOnly
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* 样式配置 */}
            {toolType === CANVAS_ELE_TYPE.FREE_DRAW && (
              <div className="mt-3">
                <div className="font-bold">Style</div>
                <div className="btn-group flex">
                  {styleSwitch.line_1.map(({ type, text }) => (
                    <button
                      key={type}
                      className={`btn btn-sm flex-grow ${
                        board?.currentFreeDrawStyle === type ? 'btn-active' : ''
                      }`}
                      onClick={() => setFreeDrawStyle(type)}
                    >
                      {t(text)}
                    </button>
                  ))}
                </div>
                <div className="btn-group mt-1 flex">
                  {styleSwitch.line_2.map(({ type, text }) => (
                    <button
                      key={type}
                      className={`btn btn-sm flex-grow ${
                        board?.currentFreeDrawStyle === type ? 'btn-active' : ''
                      }`}
                      onClick={() => setFreeDrawStyle(type)}
                    >
                      {t(text)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* 自由渲染 */}
            {toolType === CANVAS_ELE_TYPE.RENDER && (
              <div className='mt-3'>
                <div>在这里上传含有所需要提取的笔刷的图片(png, jpg, etc.)</div>
                <button className='btn btn-sm flex-grow' onClick={() => uploadImage()}>上传图片</button>
              </div>
            )

            }
            {/* 操作画板 */}
            <div className="mt-3">
              <div className="font-bold">Tool</div>
              <ul className="menu menu-horizontal bg-base-100 rounded-box justify-between mt-1">
                <li>
                  <a onClick={undo}>
                    <div className="tooltip" data-tip={t('operate.undo')}>
                      <UndoIcon />
                    </div>
                  </a>
                </li>
                <li>
                  <a onClick={redo}>
                    <div className="tooltip" data-tip={t('operate.redo')}>
                      <RedoIcon />
                    </div>
                  </a>
                </li>
                <li>
                  <a onClick={clean}>
                    <div className="tooltip" data-tip={t('operate.clean')}>
                      <CleanIcon />
                    </div>
                  </a>
                </li>
                <li>
                  <a onClick={saveImage}>
                    <div className="tooltip" data-tip={t('operate.save')}>
                      <SaveIcon />
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            {/* 图层设置 */}
            <Layer board={board} refresh={() => setRefresh((v) => v + 1)} />
          </>
        )}
      </div>
      {toastState && (
        <div className="toast toast-top toast-center">
          <div className="alert alert-success">
            <div>
              <span className="whitespace-nowrap">Copy successfully.</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ToolPanel
