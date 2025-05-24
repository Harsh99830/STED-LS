import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const completeTask = async (userId, taskXP) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    const newXP = data.xp + taskXP;
    const newLevel = Math.floor(newXP / 100); // Customize level system if needed

    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
      tasksCompleted: data.tasksCompleted + 1,
    });
  }
};
