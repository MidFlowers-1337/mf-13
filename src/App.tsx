import Home from "@/pages/Home";
import { LevelEditor } from "@/components/LevelEditor";
import { TrainingMode } from "@/components/TrainingMode";
import { useGameStore } from "@/store/gameStore";

export default function App() {
  const currentView = useGameStore(s => s.currentView);

  if (currentView === 'editor') {
    return <LevelEditor />;
  }

  if (currentView === 'training') {
    return <TrainingMode />;
  }

  return <Home />;
}
