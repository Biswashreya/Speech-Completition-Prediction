import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ className = "", children, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
