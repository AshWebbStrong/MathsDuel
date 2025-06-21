export default function OnScreenKeyboard({
  layout,
  onKeyPress,
  onBackspace,
  onSubmit,
  previewMode = false,
}) {
  const { topRow = [], middleRow = [], bottomRow = [] } = layout;

  return (
    <div className="flex flex-col gap-2">
      {/* Top Row */}
      <div className="grid grid-cols-10 gap-2">
        {topRow.map((key, i) => {
          if (key === null) {
            return (
              <div
                key={`top-${i}`}
                className="bg-gray-100 p-4 rounded text-gray-400 cursor-default select-none"
                aria-hidden="true"
                style={{ userSelect: 'none' }}
              >
                &nbsp;
              </div>
            );
          }
          return (
            <button
              key={`top-${i}`}
              type="button"
              onClick={() => !previewMode && onKeyPress && onKeyPress(key)}
              className="bg-white p-4 rounded text-black font-bold"
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-10 gap-2">
        {middleRow.map((num, i) => (
          <button
            key={`mid-${i}`}
            onClick={() => !previewMode && onKeyPress && onKeyPress(num)}
            className="bg-white p-4 rounded text-black font-bold"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-2">
        {bottomRow.includes("space") && (
          <button
            onClick={() => !previewMode && onKeyPress && onKeyPress(" ")}
            className="col-span-2 bg-gray-300 p-4 rounded font-bold"
          >
            Space
          </button>
        )}
        {bottomRow.includes("submit") && (
          <button
            onClick={() => !previewMode && onSubmit && onSubmit()}
            className="col-span-8 bg-green-600 p-4 rounded text-white font-bold"
          >
            Submit
          </button>
        )}
        {bottomRow.includes("backspace") && (
          <button
            onClick={() => !previewMode && onBackspace && onBackspace()}
            className="col-span-2 bg-red-500 p-4 rounded text-white font-bold"
          >
            ⌫
          </button>
        )}
      </div>
    </div>
  );
}



