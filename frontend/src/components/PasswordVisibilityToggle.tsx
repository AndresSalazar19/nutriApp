import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface Props {
  visible: boolean;
  onClick: () => void;
}

export function PasswordVisibilityToggle({
  visible,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-400 hover:text-gray-600"
    >
      {visible ? (
        <FaEyeSlash size={18} />
      ) : (
        <FaEye size={18} />
      )}
    </button>
  );
}