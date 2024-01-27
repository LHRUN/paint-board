import useBoardStore from '@/store/board'

const GuideLineCOnfig = () => {
  const { openGuideLine, updateOpenGuideLine } = useBoardStore()

  return (
    <div className="form-control mt-3">
      <div className="font-bold font-fredokaOne">GuideLine</div>
      <div className="mt-1 flex items-start w-full">
        <input
          type="checkbox"
          className="toggle toggle-success"
          checked={openGuideLine}
          onChange={updateOpenGuideLine}
        />
      </div>
    </div>
  )
}

export default GuideLineCOnfig
