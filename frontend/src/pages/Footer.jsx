export default function Footer() {
  return (
    <footer className="w-full py-2 bg-gray-900 text-center text-sm text-gray-400 border-t border-gray-800">
      <p>&copy; {new Date().getFullYear()} SkillGraph. All rights reserved.</p>
    </footer>
  );
}