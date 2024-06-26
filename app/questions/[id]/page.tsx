"use client";

import React, { useState, Fragment, useEffect } from "react";
import {
  FaPlus,
  FaVideo,
  FaCheck,
  FaXmark,
  FaCalendar,
  FaShare,
  FaCircleCheck,
  FaUserClock,
} from "react-icons/fa6";
import { FaHome, FaEdit } from "react-icons/fa";
import {
  MdOutlineScheduleSend,
  MdLogout,
  MdCancelScheduleSend,
} from "react-icons/md";
import { Transition, Dialog } from "@headlessui/react";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Avatar as MAvatar } from "@mui/joy";
import { Tag, Tooltip, message } from "antd";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import Avatar from "@/public/avatar.png";
import { Question, Coder, Contributor, Comment, Scheduling } from "@/types";
import { Navbar, FAB, RenderMd } from "@/components";
import { formatDateTime } from "@/utils";
import { Comments } from "@/components";

const QuestionPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; [key: string]: any }>();
  const [coder, setCoder] = useState<Coder>();
  const [question, setQuestion] = useState<Question>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [toSendContributors, setToSendContributors] = useState<Contributor[]>();
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const devScheduling: Scheduling | undefined = schedulings.find(
    (scheduling) =>
      scheduling.scheduler_id?.id === coder?.id &&
      scheduling.status !== "reject" &&
      scheduling.status !== "delete"
  );
  // console.log(devScheduling);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isScheduleMeetOpen, setIsScheduleMeetOpen] = useState<boolean>(false);
  const [isEditScheduleMeetOpen, setIsEditScheduleMeetOpen] =
    useState<boolean>(false);
  const [isViewMeetingRequestsOpen, setIsViewMeetingRequestsOpen] =
    useState<boolean>(false);
  const [isViewMeetingsOpen, setIsViewMeetingsOpen] = useState<boolean>(false);
  const [dateTime, setDateTime] = useState<Dayjs | null>(null);
  const [scheduleMessage, setScheduleMessage] = useState<string>("");
  const [receiverNote, setReceiverNote] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  dayjs.extend(advancedFormat);
  dayjs.extend(utc);
  dayjs.extend(timezone);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: coder, error } = await supabase
          .from("coders")
          .select("*")
          .eq("auth_id", user.id)
          .single();
        if (coder) {
          setCoder(coder);
        } else {
          console.error("Error fetching referenced coder:", error);
        }
      } else {
        console.error("Error fetching logged in user:", error);
      }
    };
    const fetchQuestion = async () => {
      const { data: question, error } = await supabase
        .from("questions")
        .select("*")
        .eq("id", params.id)
        .single();
      if (question) {
        const { data: coders, error: codersError } = await supabase
          .from("coders")
          .select("*");
        if (coders) {
          question.asker = coders.find((coder) => coder.id === question.asker);
        } else {
          console.error(
            "Error fetching question's referenced coder:",
            codersError
          );
        }
        const { data: contributors, error: contributorsError } = await supabase
          .from("contributors")
          .select("*")
          .eq("question_id", question.id);
        if (contributors) {
          let contributions = [];
          for (const contributor of contributors) {
            contributions.push({
              ...contributor,
              question_id: question,
              user_id: coders?.find(
                (coder) => coder.id === contributor.user_id
              ),
            });
          }
          question.contributors = contributions;
        } else {
          console.error(
            "Error fetching question's referenced contributors:",
            contributorsError
          );
        }
        setQuestion(question);
      } else {
        console.error("Error fetching question:", error);
      }
    };
    const fetchComments = async () => {
      const { data: questionRef, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("id", params.id)
        .single();
      if (questionRef) {
        const { data: dev, error: devError } = await supabase
          .from("coders")
          .select("*")
          .eq("id", questionRef.asker);
        if (dev) {
          questionRef.asker = dev;
        } else {
          console.error("Error fetching referenced dev:", devError);
        }
      } else {
        console.error("Error fetching referenced question:", questionError);
      }
      const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("question", params.id);
      if (comments) {
        let newComments = [];
        const commentCommenterIds = comments.map(
          (comment) => comment.commenter
        );
        const { data: coders, error } = await supabase
          .from("coders")
          .select("*")
          .in("id", commentCommenterIds);
        for (const comment of comments) {
          newComments.push({
            ...comment,
            question: questionRef,
            commenter: coders?.find((coder) => coder.id === comment.commenter),
            parent_comment: comment.parent_comment
              ? comments.find((c) => c.id === comment.parent_comment)
              : null,
          });
        }
        setComments(newComments);
        setToSendContributors((prevToSendContributors) => {
          // Create a set from the existing toSendContributors
          const combinedSet = new Set(
            prevToSendContributors?.map((contributor) =>
              JSON.stringify(contributor)
            )
          );

          // Add the new unique comments
          newComments.forEach((comment) => {
            const newEntry = JSON.stringify({
              question_id: questionRef,
              user_id: comment.commenter,
            });
            combinedSet.add(newEntry);
          });

          // Convert the set back to an array of objects
          return Array.from(combinedSet).map((json) => JSON.parse(json));
        });
      } else {
        console.error("Error fetching comments:", commentsError);
      }
    };
    const fetchSchedulings = async () => {
      const { data: schedulings, error: schedulingsError } = await supabase
        .from("schedulings")
        .select("*")
        .eq("question_id", params.id);
      if (schedulings) {
        console.log("Schedulings:", schedulings);
        let newSchedulings = [];
        const { data: question, error: questionError } = await supabase
          .from("questions")
          .select("*")
          .eq("id", params.id)
          .single();
        let schedulingIds = schedulings.map(
          (scheduling: any) => scheduling.scheduler_id
        );
        console.log("Scheduling IDs:", schedulingIds);
        schedulingIds.push(schedulings[0].receiver_id);
        console.log("Scheduling IDs:", schedulingIds);
        const { data: coders, error: codersError } = await supabase
          .from("coders")
          .select("*")
          .in("id", schedulingIds);
        for (const scheduling of schedulings) {
          newSchedulings.push({
            ...scheduling,
            scheduler_id: coders?.find(
              (coder) => coder.id === scheduling.scheduler_id
            ),
            receiver_id: coders?.find(
              (coder) => coder.id === scheduling.receiver_id
            ),
            question_id: question,
          });
        }
        console.log("New Schedulings:", newSchedulings);
        setSchedulings(newSchedulings);
      } else {
        console.error("Error fetching schedulings:", schedulingsError);
      }
    };
    fetchUser();
    fetchQuestion();
    fetchComments();
    fetchSchedulings();
  }, []);

  useEffect(() => {
    setDateTime(
      devScheduling?.scheduled_time
        ? dayjs(new Date(devScheduling.scheduled_time))
        : null
    );
    setScheduleMessage(devScheduling?.sender_note || "");
  }, [devScheduling]);

  if (!question) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-row justify-center items-center gap-2 text-lg">
            Ask Question{" "}
            <Link href="/questions/add">
              <FaPlus className="text-blue-400 text-xl hover:text-blue-600 hover:scale-125" />
            </Link>
          </div>
          <div className="mx-3 scale-[2.0]">|</div>
          <div className="flex flex-row justify-center items-center gap-2 text-lg">
            Contribute to Question{" "}
            <Link href="/">
              <FaHome className="text-blue-400 text-xl hover:text-blue-600 hover:scale-125" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  console.log(dateTime);
  const formattedDate = dateTime?.toDate();
  console.log(formattedDate);
  console.log(scheduleMessage);

  let dateCheck = false;

  const handleSchedule = async () => {
    if (!dateTime) {
      messageApi.open({
        type: "error",
        content: "Please provide a date and time for your meeting",
        duration: 3,
      });
    } else {
      dateCheck = true;
    }

    const scheduleData = {
      scheduler_id: coder?.id,
      receiver_id: question.asker?.id,
      question_id: question.id,
      scheduled_time: formattedDate ? new Date(formattedDate) : null,
      sender_note: scheduleMessage || null,
    };

    if (dateCheck) {
      try {
        const { data: scheduleDataResponse, error: scheduleError } =
          await supabase.from("schedulings").insert(scheduleData).select();

        if (scheduleError) {
          console.log("Faulty data:", scheduleData);
          console.log("Error uploading scheduling data:", scheduleError);
          return;
        }

        if (scheduleDataResponse) {
          console.log("Scheduling added:", scheduleDataResponse);
          // setDidSchedule(true);
          setIsScheduleMeetOpen(false);
          router.refresh();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleScheduleEdit = async () => {
    if (!dateTime) {
      messageApi.open({
        type: "error",
        content: "Please provide a date and time for your meeting",
        duration: 3,
      });
    } else {
      dateCheck = true;
    }

    const scheduleData = {
      scheduled_time: formattedDate ? new Date(formattedDate) : null,
      sender_note: scheduleMessage || null,
      status: null,
      is_confirmed: false,
    };

    if (dateCheck) {
      try {
        const { data: scheduleDataResponse, error: scheduleError } =
          await supabase
            .from("schedulings")
            .update(scheduleData)
            .eq("id", devScheduling?.id)
            .select();

        if (scheduleError) {
          console.log("Faulty data:", scheduleData);
          console.log("Error uploading scheduling data:", scheduleError);
          return;
        }

        if (scheduleDataResponse) {
          console.log("Scheduling updated:", scheduleDataResponse);
          // setDidSchedule(false);
          setIsEditScheduleMeetOpen(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleScheduleCancel = async () => {
    try {
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("schedulings")
        .update({ status: "delete" })
        .eq("id", devScheduling?.id)
        .select();

      if (scheduleError) {
        console.log("Error deleting scheduling data:", scheduleError);
        return;
      } else {
        console.log("Scheduling deleted:", scheduleData);
        // setDidSchedule(true);
        setIsEditScheduleMeetOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSchedulingAccept = async (scheduling: Scheduling) => {
    try {
      const { data: schedulingDataResponse, error: schedulingError } =
        await supabase
          .from("schedulings")
          .update({ status: "accept", receiver_note: null, is_confirmed: true })
          .eq("id", scheduling.id)
          .select();

      if (schedulingError) {
        console.log("Faulty data:", {
          status: "accept",
          receiver_note: null,
          is_confirmed: true,
        });
        console.log("Error uploading scheduling data:", schedulingError);
        return;
      }

      if (schedulingDataResponse) {
        console.log("Scheduling updated:", schedulingDataResponse);
        // setDidSchedule(false);
        setIsEditScheduleMeetOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error accepting meeting request:", error);
    }
  };

  const handleSchedulingReject = async (scheduling: Scheduling) => {
    try {
      const { data: schedulingDataResponse, error: schedulingError } =
        await supabase
          .from("schedulings")
          .update({ status: "reject" })
          .eq("id", scheduling.id)
          .select();

      if (schedulingError) {
        console.log("Faulty data:", { status: "reject" });
        console.log("Error uploading scheduling data:", schedulingError);
        return;
      }

      if (schedulingDataResponse) {
        console.log("Scheduling updated:", schedulingDataResponse);
        // setDidSchedule(false);
        setIsEditScheduleMeetOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error rejecting meeting request:", error);
    }
  };

  const handleReschedule = async (scheduling: Scheduling) => {
    try {
      const rescheduleData = {
        status: "reschedule",
        receiver_note: receiverNote || null,
        is_confirmed: false,
      };

      const { data: schedulingDataResponse, error: schedulingError } =
        await supabase
          .from("schedulings")
          .update(rescheduleData)
          .eq("id", scheduling.id)
          .select();

      if (schedulingError) {
        console.log("Faulty data:", rescheduleData);
        console.log("Error uploading scheduling data:", schedulingError);
        return;
      }

      if (schedulingDataResponse) {
        console.log("Scheduling updated:", schedulingDataResponse);
        // setDidSchedule(false);
        setIsEditScheduleMeetOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error rescheduling meeting request:", error);
    }
  };

  const handleQuestionDelete = async () => {
    try {
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .delete()
        .eq("id", question.id)
        .select();

      if (questionError) {
        console.log("Error deleting question:", questionError);
        messageApi.open({
          type: "error",
          content: "Error deleting question",
          duration: 3,
        });
        return;
      } else {
        console.log("Question deleted:", questionData);
        messageApi.open({
          type: "success",
          content: "Successfully deleted question",
          duration: 3,
        });
        setIsDeleteOpen(false);
        router.push(`/users/${coder?.auth_id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    messageApi.open({
      type: "info",
      content: "Link copied to clipboard",
      duration: 3,
    });
  };

  return (
    <>
      {contextHolder}
      <Navbar />
      <div className="p-3 m-0">
        <div className="mx-auto max-w-7xl pt-5 pb-2 px-8 border-solid border-black border-[1px] border-x-0 border-t-0">
          <div className="flex flex-row justify-between bg-inherit">
            <h1 className="bg-inherit text-4xl text-left">
              {question.question}
            </h1>
            {/* {!question.answer ? (
              <button
                onClick={
                  !didSchedule ? () => setIsScheduleMeetOpen(true) : undefined
                }
                className={`basis-1/12 text-base font-medium p-3 h-14 self-center items-center justify-between flex flex-row border-solid border-[1px] ${
                  !didSchedule
                    ? "border-blue-600 hover:border-blue-800 bg-blue-500 hover:bg-blue-700"
                    : "border-yellow-600 bg-yellow-500 cursor-text"
                } rounded-xl`}
              >
                <FaVideo className="bg-inherit text-slate-200 mr-3" />
                <p className="bg-inherit text-slate-200">
                  {!didSchedule ? "Schedule" : "Scheduled"}
                </p>
              </button>
            ) : (
              <button className="basis-1/12 text-base font-medium p-3 h-14 self-center items-center justify-between flex flex-row border-solid border-green-600 border-[1px] bg-green-500 rounded-md">
                <FaCheck className="bg-green-500 text-slate-200 mr-3" />
                <p className="bg-green-500 text-slate-200">Answered</p>
              </button>
            )} */}
          </div>
          <div className="flex justify-center items-center gap-3 p-3 py-5">
            {question.tags?.map((tag) => <Tag>{tag}</Tag>)}
          </div>
          <div className="flex flex-row justify-between items-center my-2 bg-inherit">
            <Link href={`/users/${question.asker?.auth_id}`}>
              <span className="bg-inherit hover:underline hover:text-blue-600">
                {question.asker?.first_name} {question.asker?.last_name}
              </span>
            </Link>
            <span className="bg-inherit">
              {question.created_at &&
                formatDateTime(question.created_at.toString()).date}
              ,{" "}
              {question.created_at &&
                formatDateTime(question.created_at.toString()).time}
            </span>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 mt-3">
            {question.answer ? (
              <div className="p-3 flex flex-row items-center justify-center gap-2 border-green-700 bg-green-600 text-slate-200 rounded-lg cursor-auto">
                <FaCircleCheck className="bg-inherit text-slate-200" />
                {"Answered"}
              </div>
            ) : (
              user?.id !== question.asker?.auth_id && (
                <div
                  onClick={
                    !devScheduling
                      ? () => setIsScheduleMeetOpen(true)
                      : () => setIsEditScheduleMeetOpen(true)
                  }
                  className={`p-3 flex flex-row items-center justify-center gap-2 text-slate-200 rounded-lg ${
                    !devScheduling
                      ? "border-blue-600 hover:border-blue-800 bg-blue-500 hover:bg-blue-700 cursor-pointer"
                      : "border-violet-500 hover:border-violet-700 bg-violet-600 hover:bg-violet-800 cursor-pointer"
                  }`}
                >
                  <FaVideo className="bg-inherit text-slate-200" />
                  {!devScheduling ? "Schedule Meeting" : "Edit Meeting"}
                </div>
              )
            )}
            {user?.id === question.asker?.auth_id &&
              !question.answer &&
              schedulings.filter((s) => s.status === null).length > 0 && (
                <div
                  onClick={() => setIsViewMeetingRequestsOpen(true)}
                  className="p-3 flex flex-row items-center justify-center gap-2 border-sky-600 hover:border-sky-800 bg-sky-500 hover:bg-sky-700 text-slate-200 rounded-lg cursor-pointer"
                >
                  <FaUserClock className="bg-inherit text-slate-200" />
                  {"View Requests"}
                </div>
              )}
            {user?.id === question.asker?.auth_id &&
              !question.answer &&
              schedulings.filter((s) => s.status === "accept").length > 0 && (
                <div
                  onClick={() => setIsViewMeetingsOpen(true)}
                  className="p-3 flex flex-row items-center justify-center gap-2 border-green-600 hover:border-green-800 bg-green-500 hover:bg-green-700 text-slate-200 rounded-lg cursor-pointer"
                >
                  <FaVideo className="bg-inherit text-slate-200" />
                  {"View Meetings"}
                </div>
              )}
            {user?.id === question.asker?.auth_id && (
              <Link
                href={`/questions/${params.id}/edit`}
                className="p-3 flex flex-row items-center justify-center gap-2 border-violet-600 hover:border-violet-800 bg-violet-500 hover:bg-violet-600 text-slate-200 rounded-lg cursor-pointer"
              >
                <FaEdit className="bg-inherit text-slate-200" />
                {"Edit Question"}
              </Link>
            )}
            {user?.id === question.asker?.auth_id && (
              <div
                onClick={() => setIsDeleteOpen(true)}
                className="p-3 flex flex-row items-center justify-center gap-2 border-red-600 hover:border-red-800 bg-red-500 hover:bg-red-700 text-slate-200 rounded-lg cursor-pointer"
              >
                <MdLogout className="bg-inherit text-slate-200" />
                {"Delete Question"}
              </div>
            )}
            <div
              onClick={handleCopyLink}
              className="p-3 flex flex-row items-center justify-center gap-2 border-amber-600 hover:border-amber-800 bg-amber-500 hover:bg-amber-600 text-slate-200 rounded-lg cursor-pointer"
            >
              <FaShare className="bg-inherit text-slate-200" />
              {"Share Question"}
            </div>
          </div>
        </div>
        <RenderMd
          markdown={question.description ?? ""}
          className="mx-auto max-w-7xl py-3 px-3 mt-3 text-justify border border-solid border-black rounded-lg"
        />
        {/* {question.answer && (
          <RenderMd
            markdown={question.answer}
            className="mx-auto max-w-7xl py-3 px-3 mt-3 text-justify border border-solid border-black rounded-2xl"
          />
        )} */}
      </div>
      {user && coder && (
        <Comments
          question={question}
          coder={coder}
          contributors={toSendContributors || []}
        />
      )}

      <FAB />

      <Transition appear show={isScheduleMeetOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsScheduleMeetOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-blue-600 inline-flex items-center gap-2"
                  >
                    Schedule Your Meeting <FaVideo />
                  </Dialog.Title>
                  <div className="pb-4 mt-4 mb-1">
                    <span className="text-xs">
                      Reminder: {question.asker?.first_name}{" "}
                      {question.asker?.last_name} lives in the{" "}
                      {question.asker?.timezone} timezone.
                    </span>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label="Choose Date and Time"
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                        sx={{ marginTop: 2, width: "100%", height: "100%" }}
                        value={dateTime}
                        onChange={(newValue) => setDateTime(newValue)}
                        format="lll"
                      />
                    </LocalizationProvider>
                  </div>

                  <div>
                    <textarea
                      placeholder="Explain why you want to help and what you offer"
                      className="w-full rounded-lg placeholder:text-sm text-sm"
                      value={scheduleMessage}
                      onChange={(e) => setScheduleMessage(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mt-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-base font-medium text-yellow-900 hover:bg-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                      onClick={handleSchedule}
                    >
                      Schedule <MdOutlineScheduleSend />
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isEditScheduleMeetOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsEditScheduleMeetOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-blue-600 inline-flex items-center gap-2"
                  >
                    Edit Your Meeting <FaVideo />
                  </Dialog.Title>
                  <div className="pb-4 mt-4 mb-1">
                    {devScheduling?.status === "reschedule" &&
                    devScheduling.receiver_note ? (
                      <>
                        <span className="text-blue-400 font-bold text-sm">
                          {devScheduling.receiver_id?.first_name}{" "}
                          {devScheduling.receiver_id?.last_name} (
                          {devScheduling.receiver_id?.timezone})
                        </span>{" "}
                        <span className="text-sm">responded:</span>
                        <div className="p-2 mb-2 bg-gray-200 rounded-md text-sm">
                          {/* {Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Vestibulum scelerisque ultrices efficitur.
                            Phasellus porta ligula nisi, ut sagittis neque
                            molestie nec. Donec sagittis vitae mi eu dignissim.
                            Suspendisse scelerisque ante vitae ullamcorper
                            volutpat. Vivamus lectus nibh, dapibus non felis in,
                            dapibus imperdiet nisi. Cras consectetur semper
                            arcu, quis viverra nunc maximus id.} */}
                          {devScheduling.receiver_note}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs">
                        Reminder: {devScheduling?.receiver_id?.first_name}{" "}
                        {devScheduling?.receiver_id?.last_name} lives in the{" "}
                        {devScheduling?.receiver_id?.timezone} timezone.
                      </span>
                    )}

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label="Choose Date and Time"
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                        sx={{
                          marginTop: 2,
                          width: "100%",
                          height: "100%",
                        }}
                        value={dateTime}
                        onChange={(newValue) => setDateTime(newValue)}
                        format="lll"
                      />
                    </LocalizationProvider>
                  </div>

                  <div>
                    <textarea
                      placeholder="Explain why you want to help and what you offer"
                      className="w-full rounded-lg placeholder:text-sm text-sm"
                      value={scheduleMessage || ""}
                      onChange={(e) => setScheduleMessage(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex flex-row items-center justify-between mt-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-base font-medium text-yellow-900 hover:bg-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                      onClick={handleScheduleEdit}
                    >
                      Schedule <MdOutlineScheduleSend />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-red-100 px-4 py-2 text-base font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={handleScheduleCancel}
                    >
                      Delete <MdCancelScheduleSend />
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isViewMeetingRequestsOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsViewMeetingRequestsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-blue-600 inline-flex items-center gap-2"
                  >
                    View Meeting Requests <FaVideo />
                  </Dialog.Title>
                  {schedulings.length == 0 && (
                    <div className="py-2 mt-1">No requests yet.</div>
                  )}

                  {schedulings
                    .filter((s) => s.status === null)
                    .map((scheduling) => (
                      <>
                        <div key={scheduling.id} className="py-4 mt-2">
                          <div className="flex flex-row justify-between items-center">
                            <div className="flex justify-start items-center gap-3 basis-1/2">
                              {scheduling.scheduler_id?.profile_image ? (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/profileImg-${scheduling.scheduler_id?.auth_id}`}
                                  alt="profile picture"
                                  className="h-[15%] w-[15%] rounded-full border border-solid border-black"
                                  height={30}
                                  width={30}
                                />
                              ) : (
                                <MAvatar sx={{ "--Avatar-size": "30px" }}>
                                  {scheduling.scheduler_id?.first_name
                                    ? scheduling.scheduler_id.first_name[0]
                                    : ""}
                                  {scheduling.scheduler_id?.last_name
                                    ? scheduling.scheduler_id.last_name[0]
                                    : ""}
                                </MAvatar>
                              )}
                              <Link
                                href={`/users/${scheduling.scheduler_id?.auth_id}`}
                                target="_blank"
                                className="text-lg hover:underline hover:text-blue-600"
                              >
                                {scheduling.scheduler_id?.first_name}{" "}
                                {scheduling.scheduler_id?.last_name}
                              </Link>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                              <Tooltip
                                title="Accept"
                                color="#4ade80"
                                placement="left"
                              >
                                <div
                                  onClick={() =>
                                    handleSchedulingAccept(scheduling)
                                  }
                                  className="p-2 rounded-full border border-solid border-black hover:bg-green-100 cursor-pointer"
                                >
                                  <FaCheck className="text-green-500" />
                                </div>
                              </Tooltip>
                              <Tooltip
                                title="Reject"
                                color="#f87171"
                                placement="top"
                              >
                                <div
                                  onClick={() =>
                                    handleSchedulingReject(scheduling)
                                  }
                                  className="p-2 rounded-full border border-solid border-black hover:bg-red-100 cursor-pointer"
                                >
                                  <FaXmark className="text-red-500" />
                                </div>
                              </Tooltip>
                              <Tooltip
                                title="Reschedule"
                                color="#38bdf8"
                                placement="right"
                              >
                                <div
                                  onClick={() => handleReschedule(scheduling)}
                                  className="p-2 rounded-full border border-solid border-black hover:bg-blue-100 cursor-pointer"
                                >
                                  <FaCalendar className="text-blue-500" />
                                </div>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="mt-2 text-xs">
                            Requested session on{" "}
                            <span className="text-blue-400 font-bold text-sm">
                              {/* {MM/DD/YYYY} */}
                              {dayjs
                                .utc(scheduling.scheduled_time)
                                .tz(scheduling.receiver_id?.timezone)
                                .format("MM/DD/YYYY")}
                            </span>{" "}
                            @{" "}
                            <span className="text-blue-400 font-bold text-sm">
                              {/* {HH:MM AP} */}
                              {dayjs
                                .utc(scheduling.scheduled_time)
                                .tz(scheduling.receiver_id?.timezone)
                                .format("h:mm A")}
                            </span>
                            {scheduling.sender_note && (
                              <div className="p-2 bg-gray-200 rounded-md text-sm">
                                {/* {Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Vestibulum scelerisque ultrices efficitur.
                            Phasellus porta ligula nisi, ut sagittis neque
                            molestie nec. Donec sagittis vitae mi eu dignissim.
                            Suspendisse scelerisque ante vitae ullamcorper
                            volutpat. Vivamus lectus nibh, dapibus non felis in,
                            dapibus imperdiet nisi. Cras consectetur semper
                            arcu, quis viverra nunc maximus id.} */}
                                {scheduling.sender_note}
                              </div>
                            )}
                            <div className="mt-2">
                              <textarea
                                placeholder={`Respond to the request here. If you want to reschedule, include the date and time you want. Reminder: ${scheduling.scheduler_id?.first_name} ${scheduling.scheduler_id?.last_name} lives in the ${scheduling.scheduler_id?.timezone} timezone.`}
                                className="placeholder:text-sm text-sm w-full h-24 rounded-lg"
                                value={receiverNote}
                                onChange={(e) =>
                                  setReceiverNote(e.target.value)
                                }
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isViewMeetingsOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsViewMeetingsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-blue-600 inline-flex items-center gap-2"
                  >
                    View Meeting Requests <FaVideo />
                  </Dialog.Title>
                  {schedulings
                    .filter((s) => s.status === "accept")
                    .map((scheduling) => (
                      <>
                        <div key={scheduling.id} className="py-4 mt-2">
                          <div className="flex flex-row justify-between items-center">
                            <div className="flex justify-start items-center gap-3 basis-1/2">
                              {scheduling.scheduler_id?.profile_image ? (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/profileImg-${scheduling.scheduler_id?.auth_id}`}
                                  alt="profile picture"
                                  className="h-[15%] w-[15%] rounded-full border border-solid border-black"
                                  height={30}
                                  width={30}
                                />
                              ) : (
                                <MAvatar sx={{ "--Avatar-size": "30px" }}>
                                  {scheduling.scheduler_id?.first_name
                                    ? scheduling.scheduler_id.first_name[0]
                                    : ""}
                                  {scheduling.scheduler_id?.last_name
                                    ? scheduling.scheduler_id.last_name[0]
                                    : ""}
                                </MAvatar>
                              )}
                              <Link
                                href={`/users/${scheduling.scheduler_id?.auth_id}`}
                                target="_blank"
                                className="text-lg hover:underline hover:text-blue-600"
                              >
                                {scheduling.scheduler_id?.first_name}{" "}
                                {scheduling.scheduler_id?.last_name}
                              </Link>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                              {/* <Tooltip
                                title="Accept"
                                color="#4ade80"
                                placement="left"
                              >
                                <div
                                  onClick={() =>
                                    handleSchedulingAccept(scheduling)
                                  }
                                  className="p-2 rounded-full border border-solid border-black hover:bg-green-100 cursor-pointer"
                                >
                                  <FaCheck className="text-green-500" />
                                </div>
                              </Tooltip> */}
                              <Tooltip
                                title="Reject"
                                color="#f87171"
                                placement="top"
                              >
                                <div
                                  onClick={() =>
                                    handleSchedulingReject(scheduling)
                                  }
                                  className="p-2 rounded-full border border-solid border-black hover:bg-red-100 cursor-pointer"
                                >
                                  <FaXmark className="text-red-500" />
                                </div>
                              </Tooltip>
                              <Tooltip
                                title="Reschedule"
                                color="#38bdf8"
                                placement="right"
                              >
                                <div
                                  onClick={() => handleReschedule(scheduling)}
                                  className="p-2 rounded-full border border-solid border-black hover:bg-blue-100 cursor-pointer"
                                >
                                  <FaCalendar className="text-blue-500" />
                                </div>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="mt-2 text-xs">
                            Requested session on{" "}
                            <span className="text-blue-400 font-bold text-sm">
                              {/* {MM/DD/YYYY} */}
                              {dayjs
                                .utc(scheduling.scheduled_time)
                                .tz(scheduling.receiver_id?.timezone)
                                .format("MM/DD/YYYY")}
                            </span>{" "}
                            @{" "}
                            <span className="text-blue-400 font-bold text-sm">
                              {/* {HH:MM AP} */}
                              {dayjs
                                .utc(scheduling.scheduled_time)
                                .tz(scheduling.receiver_id?.timezone)
                                .format("h:mm A")}
                            </span>
                            {scheduling.sender_note && (
                              <div className="p-2 bg-gray-200 rounded-md text-sm">
                                {/* {Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Vestibulum scelerisque ultrices efficitur.
                            Phasellus porta ligula nisi, ut sagittis neque
                            molestie nec. Donec sagittis vitae mi eu dignissim.
                            Suspendisse scelerisque ante vitae ullamcorper
                            volutpat. Vivamus lectus nibh, dapibus non felis in,
                            dapibus imperdiet nisi. Cras consectetur semper
                            arcu, quis viverra nunc maximus id.} */}
                                {scheduling.sender_note}
                              </div>
                            )}
                            <div className="mt-2">
                              <textarea
                                placeholder={`Respond to the request here. If you want to reschedule, include the date and time you want. Reminder: ${scheduling.scheduler_id?.first_name} ${scheduling.scheduler_id?.last_name} lives in the ${scheduling.scheduler_id?.timezone} timezone.`}
                                className="placeholder:text-sm text-sm w-full h-24 rounded-lg"
                                value={receiverNote}
                                onChange={(e) =>
                                  setReceiverNote(e.target.value)
                                }
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isDeleteOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDeleteOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-black items-center justify-center"
                  >
                    Are you sure you want to delete your question?
                  </Dialog.Title>
                  <div className="flex flex-row items-center justify-center gap-4 mt-3">
                    <div
                      onClick={() => setIsDeleteOpen(false)}
                      className="cursor-pointer rounded-full border border-solid bg-slate-200 px-4 py-2 text-base font-medium text-black hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                    >
                      Cancel
                    </div>
                    <div
                      onClick={handleQuestionDelete}
                      className="cursor-pointer rounded-full border border-solid bg-red-600 px-4 py-2 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                    >
                      Delete
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default QuestionPage;
