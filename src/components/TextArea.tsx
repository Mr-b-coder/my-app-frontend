
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, id, ...rest }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#4A5E78] dark:text-[#94A3B8] mb-1"> {/* textSecondary */}
        {label}
      </label>
      <textarea
        id={id}
        name={id} /* Added name attribute */
        className="w-full px-3 py-2 border border-[#DDE3ED] dark:border-[#334155] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1545A2] dark:focus:ring-[#13B5CF] focus:border-[#1545A2] dark:focus:border-[#13B5CF] transition duration-150 ease-in-out bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0A2F5C] dark:text-[#F1F5F9] placeholder-[#8DA0B9] dark:placeholder-[#64748B] disabled:bg-[#E7ECF2] dark:disabled:bg-[#334155] disabled:text-[#8DA0B9] dark:disabled:text-[#64748B] disabled:border-[#DDE3ED] dark:disabled:border-[#334155] disabled:cursor-not-allowed custom-scrollbar"
        {...rest}
      />
    </div>
  );
};

export default TextArea;