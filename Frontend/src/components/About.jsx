import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'

export default function HackathonSection() {
  return (
    <div className="relative rounded-2xl isolate overflow-hidden bg-neutral-100/90 shadow-2xl dark:bg-black  py-1 sm:py-32 lg:overflow-visible lg:px-0 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Background SVG */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          aria-hidden="true"
          className="absolute top-0 left-[max(50%,25rem)] h-256 w-512 -translate-x-1/2 mask-[radial-gradient(64rem_64rem_at_top,white,transparent)] stroke-gray-300 dark:stroke-gray-700"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="pattern-hackathon"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-300/50 dark:fill-gray-700/50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect fill="url(#pattern-hackathon)" width="100%" height="100%" strokeWidth={0} />
        </svg>
      </div>

      {/* Content Grid */}
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        {/* Hero Text */}
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="lg:max-w-lg">
              <p className="text-base/7 font-semibold text-indigo-500">Hackathon 2025</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Build. Innovate. Deploy.
              </h1>
              <p className="mt-6 text-xl/8 text-gray-700 dark:text-gray-300">
                Join our hackathon and turn your innovative ideas into real projects. Collaborate, code, and create amazing solutions in 48 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot / Image */}
        <div className="-mt-12 -ml-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <img
            alt="Hackathon project screenshot"
            src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
            className="w-3xl max-w-none rounded-xl bg-gray-100 dark:bg-gray-800 shadow-xl ring-1 ring-white/10 sm:w-228"
          />
        </div>

        {/* Features */}
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="max-w-xl text-base/7 text-gray-700 dark:text-gray-300 lg:max-w-lg">
              <p>
                Hackathons are fast-paced events where innovation meets collaboration. Whether you are a coder, designer, or entrepreneur, there's something for everyone.
              </p>
              <ul role="list" className="mt-8 space-y-8 text-gray-700 dark:text-gray-300">
                <li className="flex gap-x-3">
                  <CloudArrowUpIcon aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-indigo-500" />
                  <span>
                    <strong className="font-semibold text-gray-900 dark:text-white">Deploy your ideas.</strong> Get hands-on experience launching projects in real-time during the hackathon.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <LockClosedIcon aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-indigo-500" />
                  <span>
                    <strong className="font-semibold text-gray-900 dark:text-white">Secure collaboration.</strong> Work safely with your team and maintain full control of your project.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <ServerIcon aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-indigo-500" />
                  <span>
                    <strong className="font-semibold text-gray-900 dark:text-white">Reliable infrastructure.</strong> Use cloud services and backups to keep your projects running smoothly.
                  </span>
                </li>
              </ul>
              <p className="mt-8">
                At the end of the event, showcase your work to judges and peers, earn prizes, and gain valuable experience. Hackathons are the perfect place to challenge yourself and innovate.
              </p>
              <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Ready to hack?</h2>
              <p className="mt-6">
                Sign up today, assemble your team, and prepare to create the next big thing. 48 hours. Unlimited creativity. One unforgettable experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
