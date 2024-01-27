import useDrawStore from '@/store/draw'
import { MaterialSwitch } from './constant'

const MaterialConfig = () => {
  const { materialType, updateMaterialType, drawColors } = useDrawStore()

  return (
    <>
      <div className="mt-3">
        <div className="font-bold text-base font-fredokaOne">Material Type</div>
        <div className="btn-group mt-1 flex">
          {MaterialSwitch.map(({ type, image }, index) => (
            <button
              key={index}
              className={`btn btn-xs flex-grow ${
                materialType === type ? 'btn-active' : ''
              }`}
              onClick={() => {
                updateMaterialType(type)
              }}
            >
              <img
                src={image}
                alt=""
                className={`w-5 h-3 opacity-60 rounded-sm`}
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
