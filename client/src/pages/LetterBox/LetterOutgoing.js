import React, { useEffect, useState } from "react";
import * as L from "./LetterBoxStyled";
import LetterOutItem from "./LetterOutItem";
import useStore from "../../store/store";
import { useInView } from "react-intersection-observer";
import { getCookie } from "../Certified/Cookie";
import axios from "axios";
import Refresh from "../../util/Refresh";

function LetterOutgoing({
  trash,
  isFocus,
  searchOut,
  filteredOut,
  selectId,
  setSelectId,
  setCurrentFilter,
  isPeriod,
  periodOut,
}) {
  const { outLetters, setOutLetters } = useStore();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [ref, inView] = useInView();

  const getLetters = async (page) => {
    return await axios({
      method: "get",
      url: `/api/sendy/mailbox/messages/out?page=${page}`,
      headers: {
        "ngrok-skip-browser-warning": "230328",
        Authorization: getCookie("accessToken"),
      },
    });
  };
  // console.log(isLoading);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentFilter("최신순");
    getLetters(1);
  }, []);

  useEffect(() => {
    getLetters(page)
      .then((res) => {
        setOutLetters(
          page === 1 ? res.data.data : [...outLetters, ...res.data.data]
        );
      })
      .catch((err) => {
        if (err.response.status === 401) {
          Refresh().then(() =>
            getLetters(page).then((res) => {
              setOutLetters(
                page === 1 ? res.data.data : [...outLetters, ...res.data.data]
              );
            })
          );
        }
      });
  }, [page]);

  // useEffect(() => {
  //   getLetters(page);
  // }, [page]);

  useEffect(() => {
    if (inView && !isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        setPage((prev) => prev + 1);
        setIsLoading(false);
        // console.log("무한 스크롤 요청🥲");
      }, 1500);
    }
  }, [inView]);

  return (
    <L.ListContainer>
      {/* <L.ListDateContainer>
        <L.ListDate>2023.03</L.ListDate>
        <L.ListBar></L.ListBar>
      </L.ListDateContainer> */}
      <L.ItemWrap>
        <L.ItemContainer>
          {isFocus ? (
            searchOut.length === 0 ? (
              <L.NotSearch>해당하는 편지를 찾을 수 없어요.</L.NotSearch>
            ) : (
              searchOut.map((letter) => {
                return (
                  <LetterOutItem
                    key={letter.outgoingId}
                    letter={letter}
                    trash={trash}
                  />
                );
              })
            )
          ) : isPeriod ? (
            periodOut.map((letter) => {
              return (
                <LetterOutItem
                  key={letter.outgoingId}
                  letter={letter}
                  trash={trash}
                  selectId={selectId}
                  setSelectId={setSelectId}
                />
              );
            })
          ) : (
            filteredOut.map((letter) => {
              return (
                <LetterOutItem
                  key={letter.outgoingId}
                  letter={letter}
                  trash={trash}
                  selectId={selectId}
                  setSelectId={setSelectId}
                />
              );
            })
          )}
          <L.TargetBox ref={ref}>{isLoading && "Loading..."}</L.TargetBox>
        </L.ItemContainer>
      </L.ItemWrap>
    </L.ListContainer>
  );
}

export default LetterOutgoing;
