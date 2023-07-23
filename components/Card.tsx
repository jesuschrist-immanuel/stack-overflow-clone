"use client";

import React, { useState } from "react";
import Image from "next/image";

import Avatar from "../public/avatar.png";
import Banner from "../public/banner.png";

const Card = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center mt-2">
        <div className="relative flex flex-col items-center rounded-[20px] w-[300px] mx-auto p-4 bg-white bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:!shadow-none">
          <div className="relative flex h-32 w-full justify-center rounded-xl bg-cover">
            <Image
              src={Banner}
              alt="background cover"
              className="absolute flex h-32 w-full justify-center rounded-xl bg-cover"
            />
            <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
              <Image
                src={Avatar}
                alt="profile picture"
                className="h-full w-full rounded-full"
              />
            </div>
          </div>
          <div className="mt-16 flex flex-col items-center bg-white">
            <h4 className="text-xl font-bold text-navy-700 bg-white dark:text-white">
              Adela Parkson
            </h4>
            <p className="text-base font-normal bg-white text-gray-600">
              Product Manager
            </p>
            <div className="mt-1 flex items-center bg-white gap-x-1.5">
              <div className="flex-none rounded-full bg-white bg-emerald-500/20 p-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs leading-5 text-gray-500 bg-white">Online</p>
            </div>
          </div>
          <div className="mt-6 mb-3 flex gap-14 bg-white md:!gap-14">
            <div className="flex flex-col items-center justify-center bg-inherit">
              <p className="text-2xl font-bold text-navy-700 bg-inherit dark:text-white">
                17
              </p>
              <p className="text-sm font-normal bg-inherit text-gray-600">
                Posts
              </p>
            </div>
            <div className="flex flex-col items-center justify-center bg-inherit">
              <p className="text-2xl font-bold text-navy-700 bg-inherit dark:text-white">
                9.7K
              </p>
              <p className="text-sm font-normal text-gray-600 bg-inherit">
                Followers
              </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-inherit">
              <p className="text-2xl font-bold text-navy-700 bg-inherit dark:text-white">
                434
              </p>
              <p className="text-sm font-normal text-gray-600 bg-inherit">
                Following
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
