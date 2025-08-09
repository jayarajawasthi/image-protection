import React from "react";
import logo from "../assets/logo.png";
import car from "../assets/testimonial/car.png"
import calllog from "../assets/testimonial/calllog.png"
import googleceos from "../assets/testimonial/googleceos.png"
import buildwhatyoulove from "../assets/testimonial/buildwhatyoulove.png"

export default function BentoGridImage() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-center text-base/7 font-semibold text-indigo-600">
          Blur instantly
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
          Everything you need to blur your sensitive details
        </p>
        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          <div className="relative lg:row-span-2">
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-4xl" />
            <div className="relative flex h-full flex-col overflow-hidden rounded[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <div className="@container relative min-h-120 w-full grow max-lg:mx-auto mx-lg:max-w-sm">
                <div className="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
                  <img src={calllog} alt="" />
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 lg:rounded-l-4xl" />
          </div>

          <div className="relative max-lg:row-start-1">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-4xl" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc9var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10"></div>
              <div className="flex-flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                <img src={car} alt="" />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 max-lg:rounded-t-4xl" />
          </div>

          <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
            <div className="absolute inset-px rounded-lg bg-white" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var--radius-lg)+1px)]">
              <div className="@container flex flex-1 items-center max-lg:py-6 lg:pb-2">
                <img src={googleceos} alt="" />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5" />
          </div>

          <div className="relative lg:row-span-2">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-4xl lg:rounded-r-4xl" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <div className="relative min-h-120 w-full grow">
                <div className="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl outline outline-white/10">
                  <div className="flex bg-gray-900 outline outline-white/5">
                    <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
                      <div className="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">
                        <img src={logo} alt="" />
                      </div>
                      <div className="border-r border-gray-600/10 px-4 py-2">
                        <img src={logo} alt="" />
                      </div>
                    </div>
                  </div>

                  <div className=" flex flex-col gap-y-2 px-6 pt-6 pb-11">
                    <img src={buildwhatyoulove} alt="" />
                    <img src={logo} alt="" />
                    <img src={logo} alt="" />
                    <img src={logo} alt="" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 max-lg:rounded-b-4xl lg:rounded-r-4xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
