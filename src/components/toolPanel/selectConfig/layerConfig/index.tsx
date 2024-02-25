import BringForWardIcon from '@/components/icons/layer/bringforward.svg?react'
import SendBackWardIcon from '@/components/icons/layer/sendbackward.svg?react'
import BringToFrontIcon from '@/components/icons/layer/bringtofront.svg?react'
import SendToBackIcon from '@/components/icons/layer/sendtoback.svg?react'

import { paintBoard } from '@/utils/paintBoard'
import { useTranslation } from 'react-i18next'

const LayerConfig = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className="font-bold font-fredokaOne mt-3 text-sm">
        {t('title.layer')}
      </div>
      <ul className="menu menu-vertical lg:menu-horizontal bg-base-100 rounded-box mt-1 flex-row w-max">
        <li>
          <a className="px-1.5 py-1" onClick={() => paintBoard.bringForWard()}>
            <BringForWardIcon />
          </a>
        </li>
        <li>
          <a className="px-1.5 py-1" onClick={() => paintBoard.seendBackWard()}>
            <SendBackWardIcon />
          </a>
        </li>
        <li>
          <a className="px-1.5 py-1" onClick={() => paintBoard.bringToFront()}>
            <BringToFrontIcon />
          </a>
        </li>
        <li>
          <a className="px-1.5 py-1" onClick={() => paintBoard.sendToBack()}>
            <SendToBackIcon />
          </a>
        </li>
      </ul>
    </>
  )
}

export default LayerConfig
