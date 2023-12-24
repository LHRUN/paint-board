import { MaterialSwitch } from '../../constant'
import useDrawStore from '@/store/draw'

const MaterialConfig = () => {
  const { materialType, updateMaterialType, drawColors } = useDrawStore()

  return (
    <>
      {/* 素材切换 */}
      <div className="mt-3">
        <div className="font-bold text-lg font-fredokaOne">Material Type</div>
        <div className="btn-group mt-1 flex">
          {MaterialSwitch.map(({ type, image }, index) => (
            <button
              key={index}
              className={`btn btn-sm flex-grow ${
                materialType === type ? 'btn-active' : ''
              }`}
              onClick={() => {
                updateMaterialType(type)
              }}
            >
              <img
                src={image}
                alt=""
                className={`w-5 h-4 opacity-60 rounded-sm`}
                style={{
                  backgroundColor: drawColors[0]
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default MaterialConfig
