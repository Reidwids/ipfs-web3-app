"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import SignInButton from "./SignInButton";

export default function AccountDetails() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
        }),
      });
      fetchUser();
      setIsEditing(false);
    } catch (err) {
      window.alert("Error with editing, please try again.");
      setIsEditing(false);
    }
  };

  const fetchUser = async () => {
    if (session?.user) {
      fetch("/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const newFormData = {
            username: data.username,
            email: data.email,
          };
          setFormData(newFormData);
        });
    }
  };

  useEffect(() => {
    fetchUser();
  }, [session]);
  return (
    <div className="flex flex-col items-center space-y-5">
      {status === "unauthenticated" ? (
        <div className="flex flex-col items-center">
          <SignInButton />
          <p className="text-xs">Don't have an account? No worries!</p>
          <p className="text-xs">
            An account will be created on your first sign in!
          </p>
        </div>
      ) : (
        <div className="flex flex-col min-w-[350px] space-y-5 bg-neutral-800 p-5 rounded-lg shadow-xl">
          <form onSubmit={handleEdit}>
            <div className="flex justify-between w-full">
              {isEditing ? (
                <div className="flex flex-col items-center w-full space-y-3">
                  <div className="flex justify-between w-full">
                    <p>Username: </p>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value,
                        })
                      }
                      className="text-sm rounded-sm text-black px-2"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-between w-full">
                    <p>Email: </p>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      className="text-sm rounded-sm text-black px-2"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-20 px-4 py-1 bg-blue-500 rounded-md text-md"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex flex-col w-full space-y-3">
                  <div className="flex justify-between w-full">
                    <div className="flex">
                      <p>Username:&nbsp;</p>
                      <AnimatePresence>
                        {formData.username && (
                          <motion.p
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            {formData.username}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.img
                      src={"/img/edit.svg"}
                      width={15}
                      className="cursor-pointer"
                      height={15}
                      whileHover={{ scale: 0.9 }}
                      onClick={() => setIsEditing(true)}
                    />
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="flex">
                      <p>Email:&nbsp;</p>
                      <AnimatePresence>
                        {formData.username && (
                          <motion.p
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            {formData.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
          <button
            className="px-5 py-3 bg-blue-500 rounded-md text-xl"
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
