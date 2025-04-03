import axios from "axios";
import CryptoJS from "crypto-js";

export const loginToTes = async (username: string, password: string, systemCode: string) => {
  try {
    const res = await axios.post(
      "https://tavibe.tidesquare.com/api/auth/signin",
      { usernameOrEmail: username, password, systemCode },
      {
        headers: {
          Systemcode: "S02",
          Authority: CryptoJS.AES.encrypt("Y", "tavi@polarium.co.kr").toString(),
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getUserInfo = async (token: string, userId: string) => {
  try {
    const res = await axios.get("https://tavibe.tidesquare.com/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
        Systemcode: "S02",
        Userid: userId,
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getListRoom = async (token: string, facilityNo: string, userId: string) => {
  try {
    const res = await axios.get("https://tesapi.tidesquare.com/inventory/roomListOfFacilities/useYn/Y", {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Connection: "keep-alive",
        culture: "ko",
        Facilityno: facilityNo,
        supplierno: "1",
        Systemcode: "S02",
        timezone: "Asia/Saigon",
        Userid: userId,
        viewId: "extraInventory-chargeblock",
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
