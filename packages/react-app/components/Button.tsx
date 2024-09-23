type Props = {
  title: string;
  onClick: () => void;
  widthFull?: boolean;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  className?: string;
  style?: React.CSSProperties; // Add this line to accept style prop
};

function PrimaryButton({
  title,
  onClick,
  name,
  widthFull = false,
  disabled,
  loading,
  className = "",
  style, // Add this line to accept style prop
}: Props) {
  return (
    <button
      onClick={onClick}
      name={name}
      disabled={disabled ?? loading}
      className={`${
        widthFull ? "w-full" : "px-4"
      } ${className} font-bold bg-[#39a96c] rounded-2xl text-white py-3 flex justify-center items-center`}
      style={style} // Add this line to apply style prop
    >
      {loading ? <>Loading...</> : title}
    </button>
  );
}

export default PrimaryButton;
