



// 'use client'

// import React, { Fragment } from 'react'
// import { Disclosure, Menu, Transition } from '@headlessui/react'
// import { Bars3Icon, XMarkIcon, ArrowSmallRightIcon } from '@heroicons/react/24/outline'
// import Link from "next/link";



// function classNames(...classes: any[]) {
//   return classes.filter(Boolean).join(' ')
// }

// export default function Navbar() {
//     // const { user, loading, error } = useAuthContext();
//     const user = null; // Placeholder for user state

//   return (
//     <Disclosure as="nav" className="bg-white shadow">
//       {({ open }) => (
//         <>
//           <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
//             <div className="relative flex h-16 justify-between">
//               <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
//                 <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 border border-black bg-transparent focus:outline-none">
//                   <span className="absolute -inset-0.5" />
//                   <span className="sr-only">Open main menu</span>
//                   {open ? (
//                     <XMarkIcon className="block h-6 w-6 text-black" aria-hidden="true" />
//                   ) : (
//                     <Bars3Icon className="block h-6 w-6 text-black" aria-hidden="true" />
//                   )}
//                 </Disclosure.Button>
//               </div>
//               <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
//                 <div className="flex items-center">
//                   <Link href="/">
//                     <div className="sm:hidden">
//                       {/* <ProtonGlowLogoIconOnly iconColor="#2563eb" /> */}
//                       <span>Logo</span>
//                     </div>
//                     <div className="hidden sm:block">
//                       {/* <ProtonGlowLogo iconColor="#2563eb" wordColor1="#000000" wordColor2="#2563eb" /> */}
//                       <span>Full Logo</span>
//                     </div>
//                   </Link>
//                 </div>
//                 <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
//                   {user ? (
//                     <>
//                       <Link href="/generate/general" className="inline-flex items-center border-b-2 border-transparent hover:border-primary-colour px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900">
//                         General
//                       </Link>
//                       <Link href="/generate/redbook" className="inline-flex items-center border-b-2 border-transparent hover:border-primary-colour px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900">
//                         Redbook
//                       </Link>
//                       <Link href="/language" className="inline-flex items-center border-b-2 border-transparent hover:border-primary-colour px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900">
//                         Flashcards
//                       </Link>
//                     </>
//                   ) : (
//                     <Link href="/" className="inline-flex items-center border-b-2 border-transparent hover:border-primary-colour px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900">
//                       Home
//                     </Link>
//                   )}
//                   <Link href="/contact-us/general" className="inline-flex items-center border-b-2 border-transparent hover:border-primary-colour px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900">
//                     Contact Us
//                   </Link>
//                 </div>
//               </div>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
//                 {user ? (
//                   <Menu as="div" className="relative ml-3">
//                     <div>
//                       <Menu.Button className="relative flex p-2 rounded-xl border-2 border-primary-colour bg-transparent hover:text-white hover:bg-primary-colour text-primary-colour text-sm focus:outline-none focus:ring-2 focus:ring-primary-colour focus:ring-offset-2">
//                         <span className="absolute -inset-1.5" />
//                         <span className="sr-only">Open user menu</span>
//                         Account
//                       </Menu.Button>
//                     </div>
//                     <Transition
//                       as={Fragment}
//                       enter="transition ease-out duration-200"
//                       enterFrom="transform opacity-0 scale-95"
//                       enterTo="transform opacity-100 scale-100"
//                       leave="transition ease-in duration-75"
//                       leaveFrom="transform opacity-100 scale-100"
//                       leaveTo="transform opacity-0 scale-95"
//                     >
//                       <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//                         <Menu.Item>
//                           {({ active }) => (
//                             <Link href="/manage/users" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
//                               Settings
//                             </Link>
//                           )}
//                         </Menu.Item>
//                         <Menu.Item>
//                           {({ active }) => (
//                             <a
//                               href="#"
//                               onClick={(e) => {
//                                 e.preventDefault();
//                                 // FirebaseAuthService.logoutUser();
//                               }}
//                               className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
//                             >
//                               Log out
//                             </a>
//                           )}
//                         </Menu.Item>
//                       </Menu.Items>
//                     </Transition>
//                   </Menu>
//                 ) : (
//                   <>
//                     <Link className="text-black hover:bg-gray-100 px-2 py-1 mr-2 text-sm rounded-md flex items-center" href="/auth/signup">  
//                       Sign Up
//                     </Link>
//                     <Link className="group text-primary-colour hover:text-white hover:bg-primary-colour border border-primary-colour px-2 py-1 rounded-md flex items-center" href="/auth/login">
//                       Log in
//                       <ArrowSmallRightIcon className="h-5 w-5 ml-1 text-primary-colour group-hover:text-white" />
//                     </Link>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>

//           <Disclosure.Panel className="sm:hidden">
//             <div className="space-y-1 pb-4 pt-2">
//               {user ? (
//                 <>
//                   <Disclosure.Button as="a" href="/generate/general" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-900">
//                     General
//                   </Disclosure.Button>
//                   <Disclosure.Button as="a" href="/generate/redbook" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-900">
//                     Redbook
//                   </Disclosure.Button>
//                   <Disclosure.Button as="a" href="/language" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-900">
//                     Flashcards
//                   </Disclosure.Button>
//                 </>
//               ) : (
//                 <Disclosure.Button as="a" href="/" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-900">
//                   Home
//                 </Disclosure.Button>
//               )}
//               <Disclosure.Button as="a" href="/contact-us/general" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-900">
//                 Contact Us
//               </Disclosure.Button>
//             </div>
//           </Disclosure.Panel>
//         </>
//       )}
//     </Disclosure>
//   )
// }




'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link href="/" className="flex items-center py-4 px-2">
                <span className="font-semibold text-gray-500 text-lg">AI Tools</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/generate/general" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">General</Link>
            <Link href="/generate/redbook" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">Redbook</Link>
            <Link href="/language" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">Flashcards</Link>
          </div>
          <div className="md:hidden flex items-center">
            <button className="outline-none mobile-menu-button" onClick={toggleMenu}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="mobile-menu md:hidden">
          <ul className="">
            <li><Link href="/generate/general" className="block text-sm px-2 py-4 hover:bg-green-500 transition duration-300">General</Link></li>
            <li><Link href="/generate/redbook" className="block text-sm px-2 py-4 hover:bg-green-500 transition duration-300">Redbook</Link></li>
            <li><Link href="/language" className="block text-sm px-2 py-4 hover:bg-green-500 transition duration-300">Flashcards</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;