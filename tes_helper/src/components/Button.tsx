interface ButtonProps {
  onClick: () => any;
  children: React.ReactNode;
  className?: string;
  props?: any;
  disabled?: boolean;
}

export const Button = ({ onClick, children, className, disabled, ...props }: ButtonProps) => {
  const disableClass = disabled
    ? "text-white bg-blue-400 dark:bg-blue-500 cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center"
    : "w-fit text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
  return (
    <button className={`${disableClass} ${className || ""}`} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
