"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import MagageModels from "./manage-models/page";
import { signIn } from "next-auth/react";
import Link from "next/link";

const features = [
  {
    title: "Summarize",
    description:
      "Capture key points from documents in seconds, focusing only on the most important details.",
  },
  {
    title: "Compose",
    description:
      "Generate email responses with a single click, saving you time and effort.",
  },
  {
    title: "Translate",
    description:
      "Translate emails into your preferred language, making communication easier.",
  },
  {
    title: "Search",
    description:
      "Quickly find specific emails or information within your inbox, improving productivity.",
  },
];

export default function Home() {
  const onClick = () => {
    return signIn("google", { callbackUrl: "/email-tracking" });
  };
  return (
    <>
      <div className="font-montserrat px-15 py-12 text-black-2">
        <section>
          <div className="flex justify-between">
            <Link className="flex items-center gap-2" href="/">
              <img
                width="50"
                height="50"
                src="https://img.icons8.com/pulsar-color/50/owl.png"
                alt="owl"
              />
              <div className="text-2xl font-bold text-[#373b67]">MAILWISE</div>
            </Link>
            <button
              onClick={onClick}
              className="flex w-[200px] items-center justify-center gap-3.5 rounded-lg border border-stroke bg-[#373b67] p-4 font-semibold text-white hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50"
            >
              <span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_191_13499)">
                    <path
                      d="M19.999 10.2217C20.0111 9.53428 19.9387 8.84788 19.7834 8.17737H10.2031V11.8884H15.8266C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.9986 13.2661 19.9986 10.2217"
                      fill="#4285F4"
                    />
                    <path
                      d="M10.2055 19.9999C12.9605 19.9999 15.2734 19.111 16.9629 17.5777L13.7429 15.1331C12.8813 15.7221 11.7248 16.1333 10.2055 16.1333C8.91513 16.1259 7.65991 15.7205 6.61791 14.9745C5.57592 14.2286 4.80007 13.1801 4.40044 11.9777L4.28085 11.9877L1.13101 14.3765L1.08984 14.4887C1.93817 16.1456 3.24007 17.5386 4.84997 18.5118C6.45987 19.4851 8.31429 20.0004 10.2059 19.9999"
                      fill="#34A853"
                    />
                    <path
                      d="M4.39899 11.9777C4.1758 11.3411 4.06063 10.673 4.05807 9.99996C4.06218 9.32799 4.1731 8.66075 4.38684 8.02225L4.38115 7.88968L1.19269 5.4624L1.0884 5.51101C0.372763 6.90343 0 8.4408 0 9.99987C0 11.5589 0.372763 13.0963 1.0884 14.4887L4.39899 11.9777Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M10.2059 3.86663C11.668 3.84438 13.0822 4.37803 14.1515 5.35558L17.0313 2.59996C15.1843 0.901848 12.7383 -0.0298855 10.2059 -3.6784e-05C8.31431 -0.000477834 6.4599 0.514732 4.85001 1.48798C3.24011 2.46124 1.9382 3.85416 1.08984 5.51101L4.38946 8.02225C4.79303 6.82005 5.57145 5.77231 6.61498 5.02675C7.65851 4.28118 8.9145 3.87541 10.2059 3.86663Z"
                      fill="#EB4335"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_191_13499">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </span>
              Log In
            </button>
          </div>
          <div className="grid grid-cols-11 gap-2">
            <div className="col-span-5">
              <h1 className="mt-5 text-[40px] font-bold leading-6">
                More simple - More focus
              </h1>
              <p className="mt-8 text-[19px] font-bold italic">
                A simple and focused email management system that helps you
                manage your emails efficiently and effectively.
              </p>
              <p className="mt-[50px] text-[19px] font-bold">
                Download for free now!
              </p>
              <div className="relative mb-[50px] mt-[10px] flex flex-wrap justify-start gap-5">
                <a
                  href=""
                  className="flex w-[220px] basis-[220px] items-center gap-5 rounded-lg bg-[#373b67] px-[20px] py-[12px] text-white no-underline shadow-4 hover:translate-y-[-2px]"
                  style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                >
                  <img
                    width="24"
                    height="24"
                    src="https://img.icons8.com/pulsar-color/24/downloads-folder.png"
                    alt="downloads-folder"
                  />
                  <strong>DOWNLOAD NOW</strong>
                </a>
              </div>
            </div>
          </div>
        </section>
        <section>
          <h2 className="pb-5 pt-10 text-center text-4xl font-bold uppercase">
            Boost your work efficiency
          </h2>
          {features.map((item, index) => {
            return (
              <div className="mt-[100px] grid grid-cols-10 gap-10 text-center">
                <div className="col-span-3 p-5">
                  <h3 className="my-[15px] text-xl font-bold">{item.title}</h3>
                  <p className="px-[12%]">{item.description}</p>
                </div>
              </div>
            );
          })}
        </section>
      </div>
      {/* <DefaultLayout>
        <MagageModels />
      </DefaultLayout> */}
    </>
  );
}
