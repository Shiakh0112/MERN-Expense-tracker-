import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/slices/authSlice";
import toast from "react-hot-toast";
import { MdCameraAlt, MdPerson } from "react-icons/md";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("File must be under 5MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirm) return toast.error("Passwords do not match");
    if (password && password.length < 6) return toast.error("Password must be at least 6 characters");

    const fd = new FormData();
    if (name !== user?.name) fd.append("name", name);
    if (password) fd.append("password", password);
    if (file) fd.append("avatar", file);

    if (!fd.has("name") && !fd.has("password") && !fd.has("avatar"))
      return toast.error("No changes to save");

    const res = await dispatch(updateProfile(fd));
    if (updateProfile.fulfilled.match(res)) {
      toast.success("Profile updated!");
      setPassword("");
      setConfirm("");
      setFile(null);
    } else {
      toast.error(res.payload || "Update failed");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      <div className="card space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {preview ? (
              <img src={preview} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-indigo-100">
                <MdPerson size={48} className="text-white" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 cursor-pointer hover:bg-primaryDark transition-colors">
              <MdCameraAlt size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
            </label>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs bg-indigo-100 text-primary font-medium px-2 py-0.5 rounded-full mt-1 inline-block">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" className="input" placeholder="Leave blank to keep current" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" className="input" placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
