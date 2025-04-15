interface DisplayselectedPathsProps {
  selectedPaths: Set<string>;
}

export const DisplayselectedPaths = ({
  selectedPaths,
}: DisplayselectedPathsProps) => {
  // Create an array from the set
  const selectedArray = Array.from(selectedPaths);

  // Convert paths to readable format
  const formatPath = (path: string) => {
    return path.split("/").join(" > ");
  };

  // Remove child paths if parent is selected
  const filterSelectedPaths = (paths: string[]) => {
    return paths.filter((path) => {
      // Check if any parent path is also selected
      return !paths.some(
        (otherPath) => otherPath !== path && path.startsWith(otherPath + "/")
      );
    });
  };

  const displayPaths = filterSelectedPaths(selectedArray);

  return (
    <div className="mt-4">
      <h2 className="font-medium">Selected Items:</h2>
      {displayPaths.length === 0 ? (
        <p>No items selected</p>
      ) : (
        <ul className="list-disc ml-5 mt-2">
          {displayPaths.map((path, index) => (
            <li key={index}>{formatPath(path)}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
