const Spinner = ({ size = "md", text = "Loading..." }) => {
  const sz = size === "sm" ? "w-4 h-4 border-2" : size === "lg" ? "w-10 h-10 border-4" : "w-6 h-6 border-2";
  return (
    <div className="flex items-center justify-center gap-2 text-gray-500">
      <div className={`${sz} border-primary border-t-transparent rounded-full animate-spin`} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
};

export const TableSpinner = ({ colSpan = 5 }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-10 text-center">
      <Spinner />
    </td>
  </tr>
);

export const CardSpinner = ({ colSpan = 3 }) => (
  <div className={`col-span-${colSpan} py-10`}>
    <Spinner />
  </div>
);

export const PageSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

export default Spinner;
