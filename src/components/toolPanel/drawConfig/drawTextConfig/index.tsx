import useDrawStore from '@/store/draw'
import FontFamilyConfg from '../fontFamilyConfig'

const DrawTextConfig = () => {
  const { drawTextValue, updateDrawTextValue } = useDrawStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-lg font-fredokaOne">Draw Text</div>
      <div className="flex justify-between px-3 py-1.5 rounded-lg bg-primary cursor-pointer">
        <input
          value={drawTextValue}
          className="px-2 rounded-lg flex-1"
          onInput={(e) =>
            updateDrawTextValue((e.target as HTMLInputElement).value)
          }
        />
      </div>
      <FontFamilyConfg />
    </div>
  )
}

export default DrawTextConfig
