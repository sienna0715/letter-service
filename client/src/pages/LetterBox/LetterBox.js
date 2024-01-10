import React, { useCallback, useEffect, useState } from "react";
import * as L from "./LetterBoxStyled";
import { AiOutlineArrowUp } from "react-icons/ai";
import { HiOutlineTrash } from "react-icons/hi";
import useStore from "../../store/store";
import { getCookie } from "../Certified/Cookie";
import axios from "axios";
import Refresh from "../../util/Refresh";
import LetterHeader from "./LetterHeader";
import LetterOutgoing from "./LetterOutgoing";
import LetterReceiving from "./LetterReceiving";

function LetterBox() {
  const { outLetters, inLetters, isSend, setIsSend } = useStore();
  const [leftTab, setLeftTab] = useState(false);
  const [rightTab, setRightTab] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("최신순");
  const [trash, setTrash] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [searchOut, setSearchOut] = useState(outLetters);
  const [searchIn, setSearchIn] = useState(inLetters);
  const [filteredOut, setFilteredOut] = useState(outLetters);
  const [filteredIn, setFilteredIn] = useState(inLetters);
  const [periodOut, setPeriodOut] = useState(outLetters);
  const [periodIn, setPeriodIn] = useState(inLetters);
  const [isPeriod, setIsPeriod] = useState(false);
  const [selectId, setSelectId] = useState([]);
  const [date, setDate] = useState({
    startYear: 2023,
    startMonth: 1,
    EndYear: 2023,
    EndMonth: 1,
  });

  const filters = ["최신순", "오래된 순", "북마크"];

  // 기간
  const handleChangeDate = useCallback((name, type) => {
    if (name === "startYear" || name === "EndYear") {
      setDate((prev) => {
        const copy = { ...prev };
        copy[name] = type === "plus" ? prev[name] + 1 : prev[name] - 1;
        return copy;
      });
    }
    if (name === "startMonth" || name === "EndMonth") {
      setDate((prev) => {
        const copy = { ...prev };
        copy[name] =
          type === "plus"
            ? prev[name] > 0 && prev[name] < 12
              ? prev[name] + 1
              : prev[name]
            : prev[name] > 1 && prev[name] <= 12
            ? prev[name] - 1
            : prev[name];
        return copy;
      });
    }
  }, []);

  const handleSubmitDate = () => {
    setLeftTab(false);
    setIsPeriod(true);
    let periodL;
    let periodR;
    if (date.startMonth < 10) {
      periodL = `${date.startYear}-0${date.startMonth}`;
    } else {
      periodL = `${date.startYear}-${date.startMonth}`;
    }
    if (date.EndMonth < 10) {
      periodR = `${date.EndYear}-0${date.EndMonth}`;
    } else {
      periodR = `${date.EndYear}-${date.EndMonth}`;
    }
    if (isSend === true) {
      return setPeriodOut(
        outLetters.filter(
          (letter) =>
            letter.messageCreatedAt.slice(0, 7) >= periodL &&
            letter.messageCreatedAt.slice(0, 7) <= periodR
        )
      );
    }
    if (isSend === false) {
      return setPeriodIn(
        inLetters.filter(
          (letter) =>
            letter.messageCreatedAt.slice(0, 7) >= periodL &&
            letter.messageCreatedAt.slice(0, 7) <= periodR
        )
      );
    }
  };

  // 검색
  const handleSearch = (e) => {
    if (isSend === true) {
      return setSearchOut(
        outLetters.filter((letter) => letter.toName.includes(e.target.value))
      );
    }
    if (isSend === false) {
      return setSearchIn(
        inLetters.filter((letter) =>
          letter.outgoingNickname.includes(e.target.value)
        )
      );
    }
  };

  // 시간순 & 북마크
  const handleFiltered = (e) => {
    setCurrentFilter(e.target.textContent);
    setRightTab(false);
    // console.log(e.target.textContent)
    // console.log(currentFilter)
  };

  useEffect(() => {
    if (isSend) {
      if (currentFilter === "최신순") {
        setFilteredOut(
          outLetters.sort(
            (a, b) =>
              new Date(b.messageCreatedAt) - new Date(a.messageCreatedAt)
          )
        );
      } else if (currentFilter === "오래된 순") {
        setFilteredOut(
          outLetters.sort(
            (a, b) =>
              new Date(a.messageCreatedAt) - new Date(b.messageCreatedAt)
          )
        );
      } else if (currentFilter === "북마크")
        setFilteredOut(outLetters.filter((letter) => letter.bookMark));
    } else if (!isSend) {
      if (currentFilter === "최신순")
        setFilteredIn(
          inLetters.sort(
            (a, b) =>
              new Date(b.messageCreatedAt) - new Date(a.messageCreatedAt)
          )
        );
      if (currentFilter === "오래된 순")
        setFilteredIn(
          inLetters.sort(
            (a, b) =>
              new Date(a.messageCreatedAt) - new Date(b.messageCreatedAt)
          )
        );
      if (currentFilter === "북마크")
        setFilteredIn(inLetters.filter((letter) => letter.bookMark));
    }
  }, [currentFilter])

  // 삭제
  const handleDelete = () => {
    if (isSend) {
      axios({
        method: "patch",
        url: `/api/sendy/mailbox/outgoing/delete`,
        headers: {
          "ngrok-skip-browser-warning": "230327",
          Authorization: getCookie("accessToken"),
        },
        data: { ids: selectId },
      })
        .then(() => window.location.reload())
        .catch((err) => {
          if (err.response.status === 401) {
            Refresh().then(() => console.log("리프레시 실행"));
          }
        });
    }
    if (!isSend) {
      axios({
        method: "patch",
        url: `/api/sendy/mailbox/receiving/delete`,
        headers: {
          "ngrok-skip-browser-warning": "230327",
          Authorization: getCookie("accessToken"),
        },
        data: { ids: selectId },
      })
        .then(() => window.location.reload())
        .catch((err) => {
          if (err.response.status === 401) {
            Refresh().then(() => console.log("리프레시 실행"));
          }
        });
    }
  };

  return (
    <L.LetterBoxWrap>
      <LetterHeader
        date={date}
        filters={filters}
        setIsFocus={setIsFocus}
        onSearch={handleSearch}
        onFilter={handleFiltered}
        onSubmitDate={handleSubmitDate}
        onChangeDate={handleChangeDate}
        currentFilter={currentFilter}
        leftTab={leftTab}
        setLeftTab={setLeftTab}
        rightTab={rightTab}
        setRightTab={setRightTab}
        setIsPeriod={setIsPeriod}
      />
      <L.ListWrap>
        {isSend ? (
          <LetterOutgoing
            trash={trash}
            isFocus={isFocus}
            searchOut={searchOut}
            filteredOut={filteredOut}
            setFilteredOut={setFilteredOut}
            selectId={selectId}
            setSelectId={setSelectId}
            setCurrentFilter={setCurrentFilter}
            isPeriod={isPeriod}
            periodOut={periodOut}
          />
        ) : (
          <LetterReceiving
            trash={trash}
            isFocus={isFocus}
            searchIn={searchIn}
            filteredIn={filteredIn}
            setFilteredIn={setFilteredIn}
            selectId={selectId}
            setSelectId={setSelectId}
            setCurrentFilter={setCurrentFilter}
            isPeriod={isPeriod}
            periodIn={periodIn}
          />
        )}
      </L.ListWrap>
      <L.Gradient />
      <L.FixedButtonBox>
        <L.TopButton
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          <AiOutlineArrowUp />
        </L.TopButton>
        {trash ? (
          <>
            <L.DeleteButtonON
              className="trash-animation-on"
              onClick={() => setTrash(!trash)}
            >
              <HiOutlineTrash />
            </L.DeleteButtonON>
            <L.DeleteButton className="trash-animation" onClick={handleDelete}>
              휴지통
              <br />
              보내기
            </L.DeleteButton>
          </>
        ) : (
          <L.DeleteButtonOff
            className="trash-animation-off"
            onClick={() => setTrash(!trash)}
          >
            <HiOutlineTrash />
          </L.DeleteButtonOff>
        )}
        {isSend ? (
          <L.SendButton onClick={() => setIsSend(!isSend)}>
            보낸 <br /> 편지
          </L.SendButton>
        ) : (
          <L.ReceiveButton onClick={() => setIsSend(!isSend)}>
            받은 <br /> 편지
          </L.ReceiveButton>
        )}
      </L.FixedButtonBox>
    </L.LetterBoxWrap>
  );
}

export default LetterBox;
