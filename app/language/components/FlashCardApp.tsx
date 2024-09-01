'use client';

import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import { flashcardsData } from '../flashcardData';



// interface Flashcard {
//   chinese: string;
//   pinyin: string;
//   english: string;
// }

// const flashcardsData: Flashcard[] = [
//   { chinese: "你", pinyin: "nǐ", english: "you" },
//   { chinese: "我", pinyin: "wǒ", english: "I, me" },
//   { chinese: "是", pinyin: "shì", english: "to be (am, is, are)" },
//   { chinese: "有", pinyin: "yǒu", english: "to have" },
//   { chinese: "不", pinyin: "bù", english: "no, not" },
//   { chinese: "好", pinyin: "hǎo", english: "good" },
//   { chinese: "在", pinyin: "zài", english: "at, in, on" },
//   { chinese: "人", pinyin: "rén", english: "person" },
//   { chinese: "们", pinyin: "men", english: "plural marker" },
//   { chinese: "说", pinyin: "shuō", english: "to speak, to say" },
// ];

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  ariaLabel?: string;
  className?: string;  
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children, variant = 'primary', ariaLabel }) => {
  const baseClasses = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

interface ProgressProps {
  value: number;
}

const Progress: React.FC<ProgressProps> = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

const FlashCardApp: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [isChineseFirst, setIsChineseFirst] = useState<boolean>(true);

  const shuffleCards = (): void => {
    const shuffled = [...flashcardsData].sort(() => Math.random() - 0.5);
    setCurrentCardIndex(0);
    setIsRevealed(false);
    setKnownCards(new Set());
  };

  const handleNextCard = (): void => {
    if (currentCardIndex < flashcardsData.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsRevealed(false);
    }
  };

  const handlePrevCard = (): void => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsRevealed(false);
    }
  };

  const handleReveal = (): void => {
    setIsRevealed(true);
  };

  const handleMarkKnown = (): void => {
    setKnownCards(new Set(knownCards.add(currentCardIndex)));
    handleNextCard();
  };

  const toggleMode = (): void => {
    setIsChineseFirst(!isChineseFirst);
    setIsRevealed(false);
  };

  const renderCardContent = (): JSX.Element => {
    const currentCard = flashcardsData[currentCardIndex];
    if (!isRevealed) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className={`text-3xl font-bold mb-2 ${isChineseFirst ? 'text-blue-700' : 'text-green-700'}`}>
            {isChineseFirst ? currentCard.chinese : currentCard.english}
          </p>
          {isChineseFirst && <p className="text-xl text-gray-600">{currentCard.pinyin}</p>}
          <Button onClick={handleReveal} variant="primary" className="mt-4">
            Show
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-3xl font-bold mb-2 text-blue-700">{currentCard.chinese}</p>
          <p className="text-xl text-gray-600 mb-2">{currentCard.pinyin}</p>
          <p className="text-2xl text-green-700">{currentCard.english}</p>
        </div>
      );
    }
  };

  const progress: number = (knownCards.size / flashcardsData.length) * 100;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Flash Cards</h2>
        <div className="space-x-2">
          <Button onClick={toggleMode} variant="outline" ariaLabel="Toggle language mode">
            <ArrowsRightLeftIcon className="h-5 w-5" />
          </Button>
          <Button onClick={shuffleCards} variant="outline" ariaLabel="Shuffle cards">
            <ArrowPathIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <Progress value={progress} />
      <p className="text-sm text-gray-600 text-center">{`${knownCards.size} / ${flashcardsData.length} cards known`}</p>
      <div className="w-full h-64 bg-white shadow-lg rounded-lg">
        {renderCardContent()}
      </div>
      <div className="flex justify-between">
        <Button onClick={handlePrevCard} disabled={currentCardIndex === 0} variant="secondary">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Previous
        </Button>
        <Button onClick={handleMarkKnown} variant="outline">Mark as Known</Button>
        <Button onClick={handleNextCard} disabled={currentCardIndex === flashcardsData.length - 1}>
          Next
          <ArrowRightIcon className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default FlashCardApp;














// 'use client';

// import React, { useState } from 'react';
// import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';

// // Flashcard data and types
// interface Flashcard {
//   chinese: string;
//   pinyin: string;
//   english: string;
// }

// const flashcardsData: Flashcard[] = [
//   { chinese: "你", pinyin: "nǐ", english: "you" },
//   { chinese: "我", pinyin: "wǒ", english: "I, me" },
//   { chinese: "是", pinyin: "shì", english: "to be (am, is, are)" },
//   { chinese: "有", pinyin: "yǒu", english: "to have" },
//   { chinese: "不", pinyin: "bù", english: "no, not" },
//   { chinese: "好", pinyin: "hǎo", english: "good" },
//   { chinese: "在", pinyin: "zài", english: "at, in, on" },
//   { chinese: "人", pinyin: "rén", english: "person" },
//   { chinese: "们", pinyin: "men", english: "plural marker" },
//   { chinese: "说", pinyin: "shuō", english: "to speak, to say" },
// ];

// // Button component
// interface ButtonProps {
//   onClick: () => void;
//   disabled?: boolean;
//   children: React.ReactNode;
//   variant?: 'primary' | 'secondary' | 'outline';
//   ariaLabel?: string;
// }

// const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children, variant = 'primary', ariaLabel }) => {
//   const baseClasses = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
//   const variants = {
//     primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
//     secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
//     outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
//   };
  
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
//       aria-label={ariaLabel}
//     >
//       {children}
//     </button>
//   );
// };

// // Progress component
// interface ProgressProps {
//   value: number;
// }

// const Progress: React.FC<ProgressProps> = ({ value }) => {
//   return (
//     <div className="w-full bg-gray-200 rounded-full h-2.5">
//       <div 
//         className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
//         style={{ width: `${value}%` }}
//       ></div>
//     </div>
//   );
// };

// // Main FlashCardApp component
// const FlashCardApp: React.FC = () => {
//   const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
//   const [isFlipped, setIsFlipped] = useState<boolean>(false);
//   const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
//   const [isChineseFirst, setIsChineseFirst] = useState<boolean>(true);

//   const shuffleCards = (): void => {
//     const shuffled = [...flashcardsData].sort(() => Math.random() - 0.5);
//     setCurrentCardIndex(0);
//     setIsFlipped(false);
//     setKnownCards(new Set());
//   };

//   const handleNextCard = (): void => {
//     if (currentCardIndex < flashcardsData.length - 1) {
//       setCurrentCardIndex(currentCardIndex + 1);
//       setIsFlipped(false);
//     }
//   };

//   const handlePrevCard = (): void => {
//     if (currentCardIndex > 0) {
//       setCurrentCardIndex(currentCardIndex - 1);
//       setIsFlipped(false);
//     }
//   };

//   const handleFlip = (): void => {
//     setIsFlipped(!isFlipped);
//   };

//   const handleMarkKnown = (): void => {
//     setKnownCards(new Set(knownCards.add(currentCardIndex)));
//     handleNextCard();
//   };

//   const toggleMode = (): void => {
//     setIsChineseFirst(!isChineseFirst);
//     setIsFlipped(false);
//   };



//   const renderCardContent = (isFront: boolean): JSX.Element => {
//     if (isFront) {
//       return (
//         <div className="flex flex-col items-center justify-center h-full">
//           <p className={`text-3xl font-bold mb-2 ${isChineseFirst ? 'text-blue-700' : 'text-green-700'}`}>
//             {isChineseFirst ? currentCard.chinese : currentCard.english}
//           </p>
//           {isChineseFirst && <p className="text-xl text-gray-600">{currentCard.pinyin}</p>}
//           <p className="mt-4 text-sm text-gray-500">Click to reveal</p>
//         </div>
//       );
//     } else {
//       return (
//         <div className="flex flex-col items-center justify-center h-full">
//           <p className="text-3xl font-bold mb-2 text-blue-700">{currentCard.chinese}</p>
//           <p className="text-xl text-gray-600 mb-2">{currentCard.pinyin}</p>
//           <p className="text-2xl text-green-700">{currentCard.english}</p>
//         </div>
//       );
//     }
//   };


//   const progress: number = (knownCards.size / flashcardsData.length) * 100;
//   const currentCard: Flashcard = flashcardsData[currentCardIndex];

//   return (
//     <div className="w-full max-w-md space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-800">Flash Cards</h2>
//         <div className="space-x-2">
//           <Button onClick={toggleMode} variant="outline" ariaLabel="Toggle language mode">
//             <ArrowsRightLeftIcon className="h-5 w-5" />
//           </Button>
//           <Button onClick={shuffleCards} variant="outline" ariaLabel="Shuffle cards">
//             <ArrowPathIcon className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>
//       <Progress value={progress} />
//       <p className="text-sm text-gray-600 text-center">{`${knownCards.size} / ${flashcardsData.length} cards known`}</p>
//       <div className="relative w-full h-64 perspective-[1000px]">
//         <div 
//           className={`w-full h-full transition-all duration-500 transform-style-preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
//           onClick={handleFlip}
//         >
//           <div className="absolute inset-0 w-full h-full bg-white shadow-lg rounded-lg backface-hidden">
//             {renderCardContent(true)}
//           </div>
//           <div className="absolute inset-0 w-full h-full bg-white shadow-lg rounded-lg backface-hidden rotate-y-180">
//             {renderCardContent(false)}
//           </div>
//         </div>
//       </div>
//       <div className="flex justify-between">
//         <Button onClick={handlePrevCard} disabled={currentCardIndex === 0} variant="secondary">
//           <ArrowLeftIcon className="h-5 w-5 mr-2" />
//           Previous
//         </Button>
//         <Button onClick={handleMarkKnown} variant="outline">Mark as Known</Button>
//         <Button onClick={handleNextCard} disabled={currentCardIndex === flashcardsData.length - 1}>
//           Next
//           <ArrowRightIcon className="h-5 w-5 ml-2" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default FlashCardApp;
















// 'use client';

// import React, { useState } from 'react';
// import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';

// // Flashcard data and types
// interface Flashcard {
//   chinese: string;
//   pinyin: string;
//   english: string;
// }

// const flashcardsData: Flashcard[] = [
//   { chinese: "你", pinyin: "nǐ", english: "you" },
//   { chinese: "我", pinyin: "wǒ", english: "I, me" },
//   { chinese: "是", pinyin: "shì", english: "to be (am, is, are)" },
//   { chinese: "有", pinyin: "yǒu", english: "to have" },
//   { chinese: "不", pinyin: "bù", english: "no, not" },
//   { chinese: "好", pinyin: "hǎo", english: "good" },
//   { chinese: "在", pinyin: "zài", english: "at, in, on" },
//   { chinese: "人", pinyin: "rén", english: "person" },
//   { chinese: "们", pinyin: "men", english: "plural marker" },
//   { chinese: "说", pinyin: "shuō", english: "to speak, to say" },
// ];

// // Button component
// interface ButtonProps {
//   onClick: () => void;
//   disabled?: boolean;
//   children: React.ReactNode;
//   variant?: 'primary' | 'secondary' | 'outline';
//   ariaLabel?: string;
// }

// const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children, variant = 'primary', ariaLabel }) => {
//   const baseClasses = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
//   const variants = {
//     primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
//     secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
//     outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
//   };
  
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
//       aria-label={ariaLabel}
//     >
//       {children}
//     </button>
//   );
// };

// // Progress component
// interface ProgressProps {
//   value: number;
// }

// const Progress: React.FC<ProgressProps> = ({ value }) => {
//   return (
//     <div className="w-full bg-gray-200 rounded-full h-2.5">
//       <div 
//         className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
//         style={{ width: `${value}%` }}
//       ></div>
//     </div>
//   );
// };

// // Main FlashCardApp component
// const FlashCardApp: React.FC = () => {
//   const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
//   const [isFlipped, setIsFlipped] = useState<boolean>(false);
//   const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
//   const [isChineseFirst, setIsChineseFirst] = useState<boolean>(true);

//   const shuffleCards = (): void => {
//     const shuffled = [...flashcardsData].sort(() => Math.random() - 0.5);
//     setCurrentCardIndex(0);
//     setIsFlipped(false);
//     setKnownCards(new Set());
//   };

//   const handleNextCard = (): void => {
//     if (currentCardIndex < flashcardsData.length - 1) {
//       setCurrentCardIndex(currentCardIndex + 1);
//       setIsFlipped(false);
//     }
//   };

//   const handlePrevCard = (): void => {
//     if (currentCardIndex > 0) {
//       setCurrentCardIndex(currentCardIndex - 1);
//       setIsFlipped(false);
//     }
//   };

//   const handleFlip = (): void => {
//     setIsFlipped(!isFlipped);
//   };

//   const handleMarkKnown = (): void => {
//     setKnownCards(new Set(knownCards.add(currentCardIndex)));
//     handleNextCard();
//   };

//   const toggleMode = (): void => {
//     setIsChineseFirst(!isChineseFirst);
//     setIsFlipped(false);
//   };

//   const renderCardContent = (isFront: boolean): JSX.Element => {
//     const content = isFront ? 
//       (isChineseFirst ? 
//         <div className="text-center text-black">
//           <p className="text-4xl font-bold mb-2 text-black">{currentCard.chinese}</p>
//           <p className="text-xl text-gray-600">{currentCard.pinyin}</p>
//         </div> : 
//         <p className="text-2xl text-black">{currentCard.english}</p>
//       ) : 
//       (isChineseFirst ? 
//         <p className="text-2xl text-black">{currentCard.english}</p> : 
//         <div className="text-center">
//           <p className="text-4xl font-bold mb-2 text-black">{currentCard.chinese}</p>
//           <p className="text-xl text-gray-600">{currentCard.pinyin}</p>
//         </div>
//       );

//     return (
//       <div className="flex flex-col items-center justify-center h-full">
//         {content}
//         <p className="mt-4 text-sm text-gray-500">
//           {isFront ? "Click to reveal" : "Click to hide"}
//         </p>
//       </div>
//     );
//   };

//   const progress: number = (knownCards.size / flashcardsData.length) * 100;
//   const currentCard: Flashcard = flashcardsData[currentCardIndex];

//   return (
//     <div className="w-full max-w-md space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-800">Flash Cards</h2>
//         <div className="space-x-2">
//           <Button onClick={toggleMode} variant="outline" ariaLabel="Toggle language mode">
//             <ArrowsRightLeftIcon className="h-5 w-5" />
//           </Button>
//           <Button onClick={shuffleCards} variant="outline" ariaLabel="Shuffle cards">
//             <ArrowPathIcon className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>
//       <Progress value={progress} />
//       <p className="text-sm text-gray-600 text-center">{`${knownCards.size} / ${flashcardsData.length} cards known`}</p>
//       <div className="relative w-full h-64">
//         <div 
//           className={`w-full h-full transition-transform duration-500 transform-style-preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
//           onClick={handleFlip}
//         >
//           <div className="absolute inset-0 w-full h-full bg-white shadow-lg rounded-lg backface-hidden">
//             {renderCardContent(true)}
//           </div>
//           <div className="absolute inset-0 w-full h-full bg-white shadow-lg rounded-lg backface-hidden rotate-y-180">
//             {renderCardContent(false)}
//           </div>
//         </div>
//       </div>
//       <div className="flex justify-between">
//         <Button onClick={handlePrevCard} disabled={currentCardIndex === 0} variant="secondary">
//           <ArrowLeftIcon className="h-5 w-5 mr-2" />
//           Previous
//         </Button>
//         <Button onClick={handleMarkKnown} variant="outline">Mark as Known</Button>
//         <Button onClick={handleNextCard} disabled={currentCardIndex === flashcardsData.length - 1}>
//           Next
//           <ArrowRightIcon className="h-5 w-5 ml-2" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default FlashCardApp;















// 'use client';

// import React, { useState } from 'react';
// import { Transition } from '@headlessui/react';
// import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
// import { flashcardsData, Flashcard } from '../flashcardData';

// interface ButtonProps {
//   onClick: () => void;
//   disabled?: boolean;
//   children: React.ReactNode;
//   variant?: 'primary' | 'secondary' | 'outline';
// }

// const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children, variant = 'primary' }) => {
//   const baseClasses = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
//   const variants = {
//     primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
//     secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
//     outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
//   };
  
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
//     >
//       {children}
//     </button>
//   );
// };

// interface ProgressProps {
//   value: number;
// }

// const Progress: React.FC<ProgressProps> = ({ value }) => {
//   return (
//     <div className="w-full bg-gray-200 rounded-full h-2.5">
//       <div 
//         className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
//         style={{ width: `${value}%` }}
//       ></div>
//     </div>
//   );
// };

// const FlashCardApp: React.FC = () => {
//   const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
//   const [isFlipped, setIsFlipped] = useState<boolean>(false);
//   const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
//   const [isChineseFirst, setIsChineseFirst] = useState<boolean>(true);

//   const shuffleCards = (): void => {
//     const shuffled = [...flashcardsData].sort(() => Math.random() - 0.5);
//     setCurrentCardIndex(0);
//     setIsFlipped(false);
//     setKnownCards(new Set());
//   };

//   const handleNextCard = (): void => {
//     if (currentCardIndex < flashcardsData.length - 1) {
//       setCurrentCardIndex(currentCardIndex + 1);
//       setIsFlipped(false);
//     }
//   };

//   const handlePrevCard = (): void => {
//     if (currentCardIndex > 0) {
//       setCurrentCardIndex(currentCardIndex - 1);
//       setIsFlipped(false);
//     }
//   };

//   const handleFlip = (): void => {
//     setIsFlipped(!isFlipped);
//   };

//   const handleMarkKnown = (): void => {
//     setKnownCards(new Set(knownCards.add(currentCardIndex)));
//     handleNextCard();
//   };

//   const toggleMode = (): void => {
//     setIsChineseFirst(!isChineseFirst);
//     setIsFlipped(false);
//   };

//   const progress: number = (knownCards.size / flashcardsData.length) * 100;

//   const currentCard: Flashcard = flashcardsData[currentCardIndex];

//   const renderCardFront = (): JSX.Element => (
//     isChineseFirst ? (
//       <div className="text-center">
//         <p className="text-4xl font-bold mb-2">{currentCard.chinese}</p>
//         <p className="text-xl text-gray-600">{currentCard.pinyin}</p>
//       </div>
//     ) : (
//       <p className="text-2xl">{currentCard.english}</p>
//     )
//   );

//   const renderCardBack = (): JSX.Element => (
//     isChineseFirst ? (
//       <p className="text-2xl">{currentCard.english}</p>
//     ) : (
//       <div className="text-center">
//         <p className="text-4xl font-bold mb-2">{currentCard.chinese}</p>
//         <p className="text-xl text-gray-600">{currentCard.pinyin}</p>
//       </div>
//     )
//   );

//   return (
//     <div className="w-full max-w-md space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-800">Flash Cards</h2>
//         <div className="space-x-2">
//           <Button onClick={toggleMode} variant="outline">
//             <ArrowsRightLeftIcon className="h-5 w-5" />
//           </Button>
//           <Button onClick={shuffleCards} variant="outline">
//             <ArrowPathIcon className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>
//       <Progress value={progress} />
//       <p className="text-sm text-gray-600 text-center">{`${knownCards.size} / ${flashcardsData.length} cards known`}</p>
//       <div className="relative w-full h-64 perspective">
//         <Transition
//           show={true}
//           enter="transition-transform duration-500"
//           enterFrom="rotate-y-0"
//           enterTo={isFlipped ? "rotate-y-180" : "rotate-y-0"}
//           leave="transition-transform duration-500"
//           leaveFrom={isFlipped ? "rotate-y-180" : "rotate-y-0"}
//           leaveTo="rotate-y-0"
//         >
//           <div 
//             className="absolute inset-0 w-full h-full bg-white shadow-lg rounded-lg cursor-pointer transform-style-preserve-3d"
//             onClick={handleFlip}
//           >
//             <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden">
//               {renderCardFront()}
//             </div>
//             <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden rotate-y-180">
//               {renderCardBack()}
//             </div>
//           </div>
//         </Transition>
//       </div>
//       <div className="flex justify-between">
//         <Button onClick={handlePrevCard} disabled={currentCardIndex === 0} variant="secondary">
//           <ArrowLeftIcon className="h-5 w-5 mr-2" />
//           Previous
//         </Button>
//         <Button onClick={handleMarkKnown} variant="outline">Mark as Known</Button>
//         <Button onClick={handleNextCard} disabled={currentCardIndex === flashcardsData.length - 1}>
//           Next
//           <ArrowRightIcon className="h-5 w-5 ml-2" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default FlashCardApp;











// 'use client';

// import React, { useState } from 'react';
// import { Transition } from '@headlessui/react';
// import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
// import { flashcardsData } from '../flashcardData';

// interface ButtonProps {
//   onClick: () => void;
//   disabled?: boolean;
//   children: React.ReactNode;
//   variant?: 'primary' | 'secondary' | 'outline';
// }

// const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children, variant = 'primary' }) => {
//   const baseClasses = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
//   const variants = {
//     primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
//     secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
//     outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
//   };
  
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
//     >
//       {children}
//     </button>
//   );
// };

// interface ProgressProps {
//   value: number;
// }

// const Progress: React.FC<ProgressProps> = ({ value }) => {
//   return (
//     <div className="w-full bg-gray-200 rounded-full h-2.5">
//       <div 
//         className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
//         style={{ width: `${value}%` }}
//       ></div>
//     </div>
//   );
// };

// const FlashCardApp: React.FC = () => {
//   const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
//   const [isFlipped, setIsFlipped] = useState<boolean>(false);
//   const [knownCards, setKnownCards] = useState<Set<number>>(new Set());

//   const shuffleCards = (): void => {
//     const shuffled = [...flashcardsData].sort(() => Math.random() - 0.5);
//     setCurrentCardIndex(0);
//     setIsFlipped(false);
//     setKnownCards(new Set());
//   };

//   const handleNextCard = (): void => {
//     if (currentCardIndex < flashcardsData.length - 1) {
//       setCurrentCardIndex(currentCardIndex + 1);
//       setIsFlipped(false);
//     }
//   };

//   const handlePrevCard = (): void => {
//     if (currentCardIndex > 0) {
//       setCurrentCardIndex(currentCardIndex - 1);
//       setIsFlipped(false);
//     }
//   };

//   const handleFlip = (): void => {
//     setIsFlipped(!isFlipped);
//   };

//   const handleMarkKnown = (): void => {
//     setKnownCards(new Set(knownCards.add(currentCardIndex)));
//     handleNextCard();
//   };

//   const progress: number = (knownCards.size / flashcardsData.length) * 100;

//   return (
//     <div className="w-full max-w-md space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-800">Flash Cards</h2>
//         <Button onClick={shuffleCards} variant="outline">
//           <ArrowPathIcon className="h-5 w-5" />
//         </Button>
//       </div>
//       <Progress value={progress} />
//       <p className="text-sm text-gray-600 text-center">{`${knownCards.size} / ${flashcardsData.length} cards known`}</p>
//       <div className="relative w-full h-64 perspective">
//         <Transition
//           show={true}
//           enter="transition-transform duration-500"
//           enterFrom="rotate-y-0"
//           enterTo={isFlipped ? "rotate-y-180" : "rotate-y-0"}
//           leave="transition-transform duration-500"
//           leaveFrom={isFlipped ? "rotate-y-180" : "rotate-y-0"}
//           leaveTo="rotate-y-0"
//         >
//           <div 
//             className="absolute inset-0 w-full h-full bg-white shadow-lg rounded-lg cursor-pointer transform-style-preserve-3d"
//             onClick={handleFlip}
//           >
//             <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden">
//               <p className="text-4xl font-bold text-black">{flashcardsData[currentCardIndex].front}</p>
//             </div>
//             <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden rotate-y-180">
//               <p className="text-2xl text-black">{flashcardsData[currentCardIndex].back}</p>
//             </div>
//           </div>
//         </Transition>
//       </div>
//       <div className="flex justify-between">
//         <Button onClick={handlePrevCard} disabled={currentCardIndex === 0} variant="secondary">
//           <ArrowLeftIcon className="h-5 w-5 mr-2" />
//           Previous
//         </Button>
//         <Button onClick={handleMarkKnown} variant="outline">Mark as Known</Button>
//         <Button onClick={handleNextCard} disabled={currentCardIndex === flashcardsData.length - 1}>
//           Next
//           <ArrowRightIcon className="h-5 w-5 ml-2" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default FlashCardApp;