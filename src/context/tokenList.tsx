
import axios from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";

export const TokenListContext = createContext({
  splTokenList: [],
  setSplTokenList: (data: any) => { }
});

export const useTokenList = () => {
  const { splTokenList, setSplTokenList } = useContext(TokenListContext);
  return { splTokenList, setSplTokenList };
};

const SplTokenProvider = ({ children }: { children: any }) => {
  const [splTokenList, setSplTokenList] = useState([]);

  const updateSplTokenList = (newSplTokenList: any) => {
    setSplTokenList(newSplTokenList);
  };
  const initTokenList = async () => {
    try {
      let { data } = await axios.get("https://cache.jup.ag/tokens");
      setSplTokenList(data);
    } catch (err) { }
  };

  useEffect(() => {
    initTokenList();
  }, []);

  return (
    <TokenListContext.Provider
      //@ts-ignore
      value={{ splTokenList, setSplTokenList: updateSplTokenList }}
    >
      {children}
    </TokenListContext.Provider>
  );
};

export default SplTokenProvider;
