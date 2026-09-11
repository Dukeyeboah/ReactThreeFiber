import Scene from './Scene';
import PracticeScene from './PracticeScene';
import './App.css';

/** Set false to restore the full Stage + interaction scene. */
const PRACTICE_MODE = true;

function App() {
  return (
    <div className='app-container flex justify-center items-center ml-auto mr-auto'>
      {PRACTICE_MODE ? <PracticeScene /> : <Scene />}
    </div>
  );
}

export default App;
