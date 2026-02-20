"use client";

import { useState } from "react";
import { auth } from "../../lib/firebase";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const SKILLS = [
  "Python",
  "C",
  "Java",
  "Cooking",
  "Music",
  "Dance",
  "Accounting",
  "Financial Literacy",
  "Yoga",
  "Fitness Training",
];
const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Delhi",
  "Goa",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

export default function Dashboard() {
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const [selectedOffered, setSelectedOffered] = useState("");
  const [offeredLevel, setOfferedLevel] = useState(0);
  const [skillsOffered, setSkillsOffered] = useState([]);

  const [selectedWanted, setSelectedWanted] = useState("");
  const [wantedLevel, setWantedLevel] = useState(0);
  const [skillsWanted, setSkillsWanted] = useState([]);

  const db = getFirestore();

  const addOfferedSkill = () => {
    if (!selectedOffered || offeredLevel === 0) return;

    setSkillsOffered([
      ...skillsOffered,
      { name: selectedOffered, level: offeredLevel },
    ]);

    setSelectedOffered("");
    setOfferedLevel(0);
  };

  const addWantedSkill = () => {
    if (!selectedWanted || wantedLevel === 0) return;

    setSkillsWanted([
      ...skillsWanted,
      { name: selectedWanted, level: wantedLevel },
    ]);

    setSelectedWanted("");
    setWantedLevel(0);
  };

  const saveProfile = async () => {
    try {
      const user = auth.currentUser;

      await updateDoc(doc(db, "users", user.uid), {
        bio,
        location,
        skillsOffered,
        skillsWanted,
      });

      alert("Profile updated successfully 💜");
      window.location.href = "/ready";
    } catch (error) {
      console.error(error);
      alert("Error saving profile");
    }
  };

  const renderStars = (level, setLevel) => (
    <div className="flex justify-center gap-1 text-2xl cursor-pointer mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setLevel(star)}
          className={star <= level ? "text-yellow-500" : "text-gray-400"}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg text-center space-y-6">
        <h1 className="text-3xl font-bold text-purple-600">
          Complete Your Profile 💜
        </h1>

        <input
          type="text"
          placeholder="Your Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 border rounded"
        />

<div>
  <h2 className="font-semibold">Location (Optional)</h2>
  <select
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    className="w-full p-3 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
  >
    <option value="">Select State (Optional)</option>
    {STATES.map((state) => (
      <option key={state} value={state}>
        {state}
      </option>
    ))}
  </select>
</div>

        {/* Skills Offered */}
        <div>
          <h2 className="font-semibold">Skills You Offer</h2>
          <select
            value={selectedOffered}
            onChange={(e) => setSelectedOffered(e.target.value)}
            className="w-full p-3 border rounded mt-2"
          >
            <option value="">Select Skill</option>
            {SKILLS.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          {renderStars(offeredLevel, setOfferedLevel)}

          <button
            onClick={addOfferedSkill}
            className="mt-2 bg-purple-400 text-white px-4 py-2 rounded"
          >
            Add Skill
          </button>

          <div className="mt-2 text-sm">
            {skillsOffered.map((skill, index) => (
              <div key={index}>
                {skill.name} - {"★".repeat(skill.level)}
              </div>
            ))}
          </div>
        </div>

        {/* Skills Wanted */}
        <div>
          <h2 className="font-semibold">Skills You Want</h2>
          <select
            value={selectedWanted}
            onChange={(e) => setSelectedWanted(e.target.value)}
            className="w-full p-3 border rounded mt-2"
          >
            <option value="">Select Skill</option>
            {SKILLS.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          {renderStars(wantedLevel, setWantedLevel)}

          <button
            onClick={addWantedSkill}
            className="mt-2 bg-purple-400 text-white px-4 py-2 rounded"
          >
            Add Skill
          </button>

          <div className="mt-2 text-sm">
            {skillsWanted.map((skill, index) => (
              <div key={index}>
                {skill.name} - {"★".repeat(skill.level)}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={saveProfile}
          className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}