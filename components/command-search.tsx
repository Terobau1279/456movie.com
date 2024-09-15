import { Show } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from 'next/link'

interface CarousalCardProps {
  isDetailsPage?: boolean;
  show: Show;
  type?: string;
  id?: string;
}

export default function CarousalCard(props: CarousalCardProps) {
  const { show, isDetailsPage, type } = props;

  return (
    <>
      {props.show && (
        <>
          <div className="flex md:hidden   h-[70vh]   relative">
            <img
              alt=""
              className="inset-0 object-cover rounded-t-xl   h-full w-full"
              src={`https://image.tmdb.org/t/p/original/${props.show.poster_path}`}
            />
            <div className="   border-white absolute flex justify-between bg-gradient-to-t from-background to-transparent bottom-0 top-1/2 w-full   flex-col    ">
              <div></div>
              <div className="flex items-center flex-col">
                <div className="text-3xl text-pretty flex text-center w-9/12 items-center justify-center  font-bold">
                  {props.show.title || props.show.name}
                </div>
                <div className="opacity-50">
                  {props.show.genres?.name?.join(",") || "Comedy"}{" "}
                  {" • " +
                    (
                      props.show.release_date || props.show.first_air_date
                    ).split("-")[0]}
                </div>

                {props.show.genres?.map((genre: any) => {
                  return (
                    <Badge
                      key={genre.id}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      {genre.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="relative h-[70vh] md:flex hidden w-full  mx-auto  ">
            <img
              alt=""
              className=" h-full w-full rounded-t-xl object-center object-cover"
              src={`https://image.tmdb.org/t/p/original/${show.backdrop_path}`}
            />
            <div className="inset-0 bg-gradient-to-t from-background to-from-background/10  absolute justify-between flex flex-col">
              <div></div>
              <div className="w-[96%] mx-auto">
                <div className=" flex gap-1 flex-col  uppercase w-[500px] text-pretty">
                  <div className="text-sm normal-case opacity-50">
                    {props.show.release_date || props.show.first_air_date
                      ? format(
                          new Date(
                            props.show.release_date || props.show.first_air_date
                          ),
                          "PPP"
                        )
                      : "Unknown"}
                  </div>
                  <div className="text-3xl text-pretty font-bold ">
                    {show.title || show.name}
                  </div>
                  <div className="text-xs opacity-50 normal-case line-clamp-3">
                    {show?.overview}
                  </div>
                  <div className="flex my-2  gap-2">
                    <Link href={`/${props.type}/${show.id}`}>
                      <Button
                        variant={"ringHover"}
                        className="whitespace-nowrap w-full"
                      >
                        Go To Show
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
 111 changes: 111 additions & 0 deletions111  
components/common/icons.tsx
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,111 @@
import {
  LucideProps,
  Moon,
  Search,
  SunMedium,
  Clapperboard,
  PawPrint,
  CircleCheckBig,
  type Icon as LucideIcon,
} from "lucide-react";

export type Icon = typeof LucideIcon;

export const Icons = {
  sun: SunMedium,
  moon: Moon,
  clapperboard: Clapperboard,
  search: Search,
  paw: PawPrint,
  check: CircleCheckBig,
  blank: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="0"
      height="0"
      viewBox="0 0 0 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-twitter"
      {...props}
    >
      <path
        fill="currentColor"
        d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
      />
    </svg>
  ),
  twitter: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-twitter"
      {...props}
    >
      <path
        fill="currentColor"
        d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
      />
    </svg>
  ),
  gitHub: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-github"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path fill="currentColor" d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  mobile_button: (props: LucideProps) => (
    <svg
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      {...props}
    >
      <path
        d="M3 5H11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3 12H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3 19H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  ),
};
