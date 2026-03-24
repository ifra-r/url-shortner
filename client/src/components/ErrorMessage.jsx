export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div
      className="text-sm px-4 py-3 rounded border"
      style={{ color: '#e53e3e', borderColor: '#e53e3e', backgroundColor: '#1a0a0a' }}
    >
      {message}
    </div>
  )
}