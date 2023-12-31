"use client";

import React, { useState } from "react";
import Image from "next/image";
import { message, Select } from "antd";
import { FaUpload, FaCamera } from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";

import { Project as ProjectType } from "@/types";
import { users, techSkills } from "@/dummy/questions";
import { allIcons } from "@/utils/icons";
import { labelValues, uniqueArray } from "@/utils";

const { Option } = Select;

const NewProjectForm = () => {
  const [newProjectImage, setNewProjectImage] = useState<string>("");
  const [newProject, setNewProject] = useState<ProjectType>({
    id: 0, // Provide default values or replace with actual values
    owner: users[0],
    name: "",
    description: "",
    startDate: new Date(),
    endDate: undefined, // or specify a default value
    github: "",
    status: "ongoing",
    image: newProjectImage || "",
    stack: [],
    needed: [], // Initialize as an empty array
    application: "",
  });
  console.log(newProject.needed);

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      setNewProjectImage(URL.createObjectURL(img));
    }
  };

  const handleStackChange = (value: string[]) => {
    setNewProject({
      ...newProject,
      stack: value,
    });
  };

  const handleSkillChange = (value: string) => {
    setNewProject({
      ...newProject,
      needed: newProject.needed ? [...newProject.needed, value] : [value],
    });
  };

  // Form Actions
  const [messageApi, contextHolder] = message.useMessage();

  const handleFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (newProject.name.trim() === "") {
      messageApi.open({
        type: "error",
        content: "Please provide a project title",
        duration: 3,
      });
    }

    if (newProject.description.trim() === "") {
      messageApi.open({
        type: "error",
        content: "Please provide a project description",
        duration: 3,
      });
    }

    if (
      newProject.application?.trim() !== "" &&
      newProject.needed?.length === 0
    ) {
      messageApi.open({
        type: "error",
        content:
          "If you are providing an application link, please provide needed skills for the project.",
        duration: 3,
      });
    } else {
      try {
        // Make database call
        // console.log("Added user to database:", userData.firstName, userData.lastName)
        // Redirect to dev profile page /users/{/* id given by database */}
      } catch (error) {
        // console.log("Error:", error)
      }
    }
  };

  return (
    <>
      {contextHolder}
      <form onSubmit={handleFormSubmit}>
        <div className="p-2 m-2">
          <div className="flex flex-col">
            <label
              htmlFor="name"
              className="flex flex-col text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              Project Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Coding OH"
              value={newProject.name === "" ? "" : newProject.name}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  name: e.target.value,
                })
              }
              className="flex flex-col w-full self-center rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="flex flex-col mt-3">
            <label
              htmlFor="description"
              className="flex flex-col text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Coding OH is this web app."
              rows={7}
              value={
                newProject.description === "" ? "" : newProject.description
              }
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  description: e.target.value,
                })
              }
              className="flex flex-col w-full self-center rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="flex flex-col mt-3">
            <label
              htmlFor="status"
              className="flex flex-col text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              Status
            </label>
            <div className="self-center">
              <select
                id="status"
                name="status"
                value={newProject.status}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    status: e.target.value as
                      | "ongoing"
                      | "completed"
                      | "on_hold",
                  })
                }
                className="flex flex-col w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              >
                <option>Ongoing</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col mt-3">
            <label
              htmlFor="github"
              className="flex flex-col text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              Github Repo
            </label>
            <input
              id="github"
              name="github"
              type="text"
              placeholder="www.github.com"
              value={newProject.github === "" ? "" : newProject.github}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  github: e.target.value,
                })
              }
              className="flex flex-col w-full self-center rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="flex flex-col mt-3">
            <label
              htmlFor="picture"
              className="flex flex-col text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              Associated Picture
            </label>
            <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              {newProjectImage === "" ? (
                <div className="text-center">
                  <FaCamera
                    className="mx-auto h-12 w-12 text-gray-300"
                    aria-hidden="true"
                  />
                  <div className="flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        value={newProject.image}
                        onChange={onImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              ) : (
                <Image
                  src={newProjectImage}
                  width={424}
                  height={172}
                  alt="New Project Picture"
                  className="w-full h-full"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col mt-3">
            <label
              htmlFor="tech-stack"
              className="flex flex-col text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              Tech Stack
            </label>
            <div className="flex flex-row justify-center items-center gap-6 w-full">
              <Select
                className="w-full"
                mode="multiple"
                placeholder="Python, TensorFlow, Pytorch, etc..."
                onChange={handleStackChange}
              >
                {Object.keys(allIcons).map((icon) => (
                  <Option value={icon}>
                    <div className="flex flex-row justify-between items-center px-3">
                      {allIcons[icon]}
                      {icon}
                    </div>
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col mt-3">
            <label
              htmlFor="needed"
              className="flex flex-col text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              Needed Skills for Project
            </label>
            <Select
              className="w-full"
              mode="tags"
              placeholder="Project Management, Kanban, Cloud Computing..."
              options={labelValues(uniqueArray(techSkills))}
              allowClear
              clearIcon={
                <IoCloseCircleOutline className="text-red-300 hover:text-red-600" />
              }
              onChange={handleSkillChange}
            />
          </div>

          <div className="flex flex-col mt-3">
            <label
              htmlFor="application"
              className="flex flex-col text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              Application to Join Project
            </label>
            <input
              id="application"
              name="application"
              type="text"
              placeholder="www.forms.gle/application"
              value={
                newProject.application === "" ? "" : newProject.application
              }
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  application: e.target.value,
                })
              }
              className="flex flex-col w-full self-center rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="inline-flex flex-row justify-between items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-base font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Upload
            <FaUpload className="ml-3 text-base bg-inherit" />
          </button>
        </div>
      </form>
    </>
  );
};

export default NewProjectForm;
