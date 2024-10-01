"use client";
import { useState } from "react";

type HideProps = {
  toggleRelatedMovies: () => void;
  showRelatedMovies: boolean;
};

export default function Hide({ toggleRelatedMovies, showRelatedMovies }: HideProps) {
  return (
    <div className="my-8">
      <button
        onClick={toggleRelatedMovies}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
      >
        {showRelatedMovies ? "Hide Related Movies" : "Show Related Movies"}
      </button>
    </div>
  );
}
