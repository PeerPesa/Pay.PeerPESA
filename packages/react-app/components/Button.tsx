type Props = {
  title: string;
  onClick: () => void;
  widthFull?: boolean;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  className?: string;
};

function PrimaryButton({
  title,
  onClick,
  name,
  widthFull = false,
  disabled,
  loading,
  className = "",
}: Props) {
  return (
    <button
      onClick={onClick}
      name={name}
      disabled={disabled ?? loading}
      className={`${
        widthFull ? "w-full" : "px-4"
      } ${className} font-bold bg-colors-secondary rounded-2xl text-white py-3 flex justify-center items-center`}
    >
      {loading ? <>Loading...</> : title}
    </button>
  );
}

export default PrimaryButton;
// pioneer jerry
