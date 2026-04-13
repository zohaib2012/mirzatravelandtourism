import { FaTools } from "react-icons/fa";

const ComingSoon = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <FaTools className="text-5xl text-accent mb-4" />
      <h2 className="text-2xl font-bold text-primary mb-2">{title || "Coming Soon"}</h2>
      <p className="text-gray-500">This module is under development and will be available soon.</p>
    </div>
  );
};

export default ComingSoon;
