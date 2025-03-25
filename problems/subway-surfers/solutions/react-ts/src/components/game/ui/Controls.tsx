interface ControlProps {
  keyName: string;
  action: string;
}

const Control = ({ keyName, action }: ControlProps) => (
  <div className="flex items-center gap-3">
    <kbd className="px-4 py-2 bg-gray-700 rounded text-amber-400 font-semibold min-w-[48px] text-center">
      {keyName}
    </kbd>
    <span className="text-gray-300">{action}</span>
  </div>
);

export const Controls = () => {
  return (
    <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-amber-400 mb-4 text-center">
        Controls
      </h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <Control keyName="↑" action="Move Up" />
          <Control keyName="↓" action="Move Down" />
          <div className="border-t border-gray-700 pt-3">
            <Control keyName="P" action="Toggle FPS" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
