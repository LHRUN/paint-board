import { fabric } from 'fabric'
import { paintBoard } from '@/core/paintBoard'
import { ActionMode } from '@/constants'

import useBoardStore from '@/store/board'
import useFileStore from '@/store/files'

import { KeyCode } from '@/constants/event'
import { ClipboardHandler } from './clipboardHandler'
import { HistoryHandler } from './historyHandler'
import { TransformCanvasHandler } from './transformCanvasHandler'
import { ModeHandler } from './modeHandler'
import { beginCanvasPan, endCanvasPan } from '../canvasPan'

/**
 * Main keyboard shortcuts handler
 * Coordinates all keyboard-related operations
 */
export class KeyboardHandler {
  private clipboardHandler: ClipboardHandler
  private historyHandler: HistoryHandler
  private transformCanvasHandler: TransformCanvasHandler
  private modeHandler: ModeHandler
  private spacePanBypass = false

  constructor() {
    this.clipboardHandler = new ClipboardHandler()
    this.historyHandler = new HistoryHandler()
    this.transformCanvasHandler = new TransformCanvasHandler()
    this.modeHandler = new ModeHandler()
  }

  /**
   * Handle keydown events
   */
  handleKeyDown = (e: KeyboardEvent) => {
    const canvas = paintBoard?.canvas
    if (!canvas) {
      return
    }

    const target = e.target as HTMLElement

    // Skip if user is typing in input fields
    if (this.isInputActive(target)) {
      return
    }

    switch (e.code) {
      case KeyCode.KEY_Q:
      case KeyCode.KEY_W:
      case KeyCode.KEY_E:
      case KeyCode.KEY_S:
      case KeyCode.KEY_X:
      case KeyCode.KEY_R:
      case KeyCode.KEY_F:
      case KeyCode.KEY_T:
      case KeyCode.KEY_G:
        this.modeHandler.switchDrawStyle(e.code)
        break

      case KeyCode.KEY_A:
        // Ctrl+A (Windows/Linux) or Cmd+A (Mac) select all elements
        if (this.isModifierKey(e) && !e.shiftKey && !e.altKey) {
          e.preventDefault() // prevent default select all behavior
          this.clipboardHandler.selectAllObjects()
        } else {
          this.modeHandler.switchDrawStyle(e.code)
        }
        break

      case KeyCode.KEY_C:
        // Ctrl+C (Windows/Linux) or Cmd+C (Mac) copy selected objects
        if (this.isModifierKey(e) && !e.shiftKey && !e.altKey) {
          this.clipboardHandler.copySelectedObjects()
        } else {
          this.modeHandler.switchDrawStyle(e.code)
        }
        break

      case KeyCode.KEY_D:
        // Ctrl+D (Windows/Linux) or Cmd+D (Mac) duplicate objects
        if (this.isModifierKey(e) && !e.shiftKey && !e.altKey) {
          e.preventDefault()
          useBoardStore.getState().updateMode(ActionMode.SELECT)
          paintBoard.copyObject()
        } else {
          this.modeHandler.switchDrawStyle(e.code)
        }
        break

      case KeyCode.KEY_V:
        // Ctrl+V (Windows/Linux) or Cmd+V (Mac) paste
        if (this.isModifierKey(e) && !e.shiftKey && !e.altKey) {
          e.preventDefault()
          this.clipboardHandler.pasteObjects()
        } else {
          this.modeHandler.switchDrawStyle(e.code)
        }
        break

      case KeyCode.KEY_B:
        if (this.isModifierKey(e) && !e.shiftKey && !e.altKey) {
          e.preventDefault()
          this.clipboardHandler.pasteClipboard()
        } else {
          this.modeHandler.switchDrawStyle(e.code)
        }
        break

      case KeyCode.KEY_Z:
        // Ctrl/Cmd + Z undo, Ctrl/Cmd + Shift + Z redo
        if (this.isModifierKey(e) && !e.altKey) {
          e.preventDefault()

          if (e.shiftKey) {
            // Ctrl/Cmd + Shift + Z - redo
            this.historyHandler.redoAction()
          } else {
            // Ctrl/Cmd + Z - undo
            this.historyHandler.undoAction()
          }
        } else {
          this.modeHandler.switchDrawStyle(e.code)
        }
        break

      case KeyCode.DIGIT_1:
      case KeyCode.DIGIT_2:
      case KeyCode.DIGIT_3:
      case KeyCode.DIGIT_4:
        // Number keys for mode switching
        this.modeHandler.switchMode(e.code)
        break

      case KeyCode.DIGIT_5:
      case KeyCode.DIGIT_6:
        this.modeHandler.switchDrawType(e.code)
        break

      case KeyCode.BACKSPACE:
        // Delete selected objects
        paintBoard.deleteObject()
        break

      case KeyCode.ARROW_UP:
      case KeyCode.ARROW_DOWN:
      case KeyCode.ARROW_LEFT:
      case KeyCode.ARROW_RIGHT:
        // Ctrl+Arrow keys (Windows/Linux) or Cmd+Arrow keys (Mac) pan canvas
        if (this.isModifierKey(e) && !e.shiftKey && !e.altKey) {
          e.preventDefault()
          this.transformCanvasHandler.panCanvas(e.code)
        }
        break

      case KeyCode.EQUAL:
      case KeyCode.NUMPAD_ADD:
        // Ctrl/Cmd + + zoom in
        if (this.isModifierKey(e) && !e.altKey) {
          e.preventDefault()
          paintBoard.evnet?.zoomEvent.updateZoom('in')
        }
        break

      case KeyCode.MINUS:
      case KeyCode.NUMPAD_SUBTRACT:
        // Ctrl/Cmd + - zoom out
        if (this.isModifierKey(e) && !e.shiftKey && !e.altKey) {
          e.preventDefault()
          paintBoard.evnet?.zoomEvent.updateZoom('out')
        }
        break

      case KeyCode.DIGIT_0:
      case KeyCode.NUMPAD_0:
        // Ctrl/Cmd + 0 reset zoom
        if (this.isModifierKey(e) && !e.shiftKey && !e.altKey) {
          e.preventDefault()
          paintBoard.evnet?.zoomEvent.resetZoom()
        }
        break

      case KeyCode.BRACKET_RIGHT:
        // Ctrl+] (Windows/Linux) or Cmd+] (Mac) bring forward
        // Ctrl+Shift+] (Windows/Linux) or Cmd+Shift+] (Mac) bring to front
        if (this.isModifierKey(e) && !e.altKey) {
          e.preventDefault()
          if (e.shiftKey) {
            paintBoard.bringToFront()
          } else {
            paintBoard.bringForWard()
          }
        }
        break

      case KeyCode.BRACKET_LEFT:
        // Ctrl+[ (Windows/Linux) or Cmd+[ (Mac) send backward
        // Ctrl+Shift+[ (Windows/Linux) or Cmd+Shift+[ (Mac) send to back
        if (this.isModifierKey(e) && !e.altKey) {
          e.preventDefault()
          if (e.shiftKey) {
            paintBoard.sendToBack()
          } else {
            paintBoard.seendBackWard()
          }
        }
        break
      case KeyCode.SPACE:
        paintBoard?.evnet?.mouseEvent.setSpaceKeyDownState(true)
        if (canvas) {
          if (!this.spacePanBypass) {
            this.spacePanBypass = true
            beginCanvasPan(canvas)
          }
          if (!useBoardStore.getState().isObjectCaching) {
            fabric.Object.prototype.set({
              objectCaching: true
            })
          }
          canvas.defaultCursor = 'pointer'
          canvas.isDrawingMode = false
          canvas.selection = false
          fabric.Object.prototype.set({
            selectable: false,
            hoverCursor: 'pointer'
          })
        }
        break
      default:
        break
    }
  }

  handleKeyUp = (e: KeyboardEvent) => {
    const canvas = paintBoard?.canvas
    if (!canvas) {
      return
    }

    switch (e.code) {
      case KeyCode.SPACE:
        /**
         * restores all states.
         */
        paintBoard.evnet?.mouseEvent.setSpaceKeyDownState(false)
        canvas.defaultCursor = 'default'
        if (this.spacePanBypass) {
          this.spacePanBypass = false
          endCanvasPan(canvas)
        }

        if (canvas.viewportTransform && paintBoard.canvasFileId) {
          useFileStore
            .getState()
            .updateTransform(
              [...canvas.viewportTransform],
              paintBoard.canvasFileId
            )
        }
        if (!useBoardStore.getState().isObjectCaching) {
          fabric.Object.prototype.set({
            objectCaching: false
          })
        }
        paintBoard.handleMode()
        break
      default:
        break
    }
  }

  /**
   * Check if modifier key (Ctrl/Cmd) is pressed
   */
  private isModifierKey(e: KeyboardEvent): boolean {
    return e.ctrlKey || e.metaKey
  }

  /**
   * Check if user is currently typing in input fields
   */
  private isInputActive(target: HTMLElement): boolean {
    return (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    )
  }
}
