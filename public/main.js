
// if ("geolocation" in navigator) {
//   console.log("geolocation available");
//   navigator.geolocation.getCurrentPosition(async (position) => {
//     lat = position.coords.latitude;
//     lon = position.coords.longitude;
//     coords.push(lat)
//     coords.push(lon)
//     // document.getElementById("latitude").textContent = lat;
//     // document.getElementById("longitude").textContent = lon;
//   });
// } else {
//   console.log("geolocation not available");
// }

$("#login").on("click", () => {
  $("#loginContainer").toggleClass("display");
  $("#registerContainer").removeClass("display");
});

$("#register").on("click", () => {
  $("#registerContainer").toggleClass("display");
  $("#loginContainer").removeClass("display");
});

var firstList = $("#first-ul")[0];
const movieNo = $("#movieNo")[0];
const getDataBtn = $("#data")[0];

async function getImdbResponse() {
  // const data = { lat, lon };
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // body: JSON.stringify(data),
  };
  const response = await fetch("/imdb", options);
  const json = await response.json();
  console.log("DATA: ", json);
  return json;
}
var imdbData;
const addToFav = [];

async function getData() {
  console.log("GET IMDB RESPONSE: ", imdbData);
  imdbData = await getImdbResponse();
  const movieArr = imdbData?.data?.comingSoonMovie?.edges;

  movieNo.innerText = `Listing ${movieArr.length} movies!`;

  movieArr.forEach((elm) => {
    // console.log(elm);
    let itemContainer = $("<div/>", {
      class: "item-container",
      click: function () {
        $(this).find(".modal-container").toggleClass("show");
      },
    }).appendTo(firstList);

    $("<div/>", {
      class: "title",
      text: `${elm.node.titleText.text}`,
    }).appendTo(itemContainer);

    let genre = elm.node.titleCardGenres.genres.map((genre) => genre.text);
    const modalContainer = $("<div/>", {
      class: "modal-container",
      id: "item-modal",
    }).appendTo(itemContainer);

    const description = $("<div/>", {
      class: "details",
    }).appendTo(modalContainer);

    $("<h1/>", {
      class: "genre",
      text: `Genre ${genre}`,
    }).appendTo(description);

    let certificate = elm.node?.certificate?.rating
      ? elm.node?.certificate?.rating
      : "no specified certificate";
    $("<h1/>", {
      class: "certificate",
      text: `Rated ${certificate}`,
    }).appendTo(description);

    let rank = elm.node?.meterRanking?.currentRank
      ? elm.node?.meterRanking?.currentRank
      : "not qualified for ranking";
    $("<h1/>", {
      class: "ranking",
      text: `Rank: ${rank}`,
    }).appendTo(description);

    let day = elm.node?.releaseDate?.day;
    let month = elm.node?.releaseDate?.month;
    let year = elm.node?.releaseDate?.year;
    let release = `${day}.${month}.${year}`;
    $("<h1/>", {
      class: "release",
      text: `Release date: ${release.replace("null.", "").trim()}`,
    }).appendTo(description);

    let trailerUrl = `https://www.imdb.com/video/${elm.node.latestTrailer?.id}`;
    const trailer = $("<a/>", {
      class: "Trailer",
      text: `Click to open trailer`,
      href: trailerUrl,
    });
    if (trailerUrl.includes("undefined")) {
      console.log(`No trailer available for movie ${elm.node.titleText.text}`);
    } else {
      trailer.appendTo(description);
    }

    const imgContainer = $("<div/>", {
      class: "img-container",
    }).appendTo(modalContainer);

    if (elm.node?.primaryImage?.url) {
      $("<img>", {
        class: "modal-img",
        src: elm.node.primaryImage.url,
      }).appendTo(imgContainer);
    } else {
      $("<img>", {
        class: "modal-img",
        src: "assets/unavailable.png",
      }).appendTo(imgContainer);
    }
  });
}
getData();

async function register() {
  const name = $("#name")[0].value;
  const email = $("#reg-email")[0].value;
  const password = $("#reg-password")[0].value;
  const data = { name, email, password };
  // console.log("Register account data", data);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/register", options);
  const json = await response.json();
  console.log("Registration response from server:", json);
  if (json.message == "Registration successful") {
    $("#registerContainer").toggleClass("display");
    $("#success-container").toggleClass("show");
    setTimeout(() => {
      $("#success-container").toggleClass("show");
    }, 5000);
  }
  if (json.status == 403) {
    const error = $("#register-error");
    error.toggleClass("show");
    error[0].innerText = json.message;
    setTimeout(() => {
      error.toggleClass("show");
    }, 5000);
  }
}
$("#reg-submit").on("click", register);

const loggedIn = [];
async function login() {
  const email = $("#email")[0].value;
  const password = $("#password")[0].value;
  const data = { email, password };
  console.log("Login account data", data);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/login", options);
  const json = await response.json();
  console.log("Login response from server:", json);
  const error = $("#error");
  if (json.status == 404) {
    error.toggleClass("show");
    error[0].innerText = json.message;
    setTimeout(() => {
      error.toggleClass("show");
    }, 5000);
  } else if (json.status == 200) {
    loggedIn.push(json.user);
    $("#login").toggleClass("hide");
    $("#register").toggleClass("hide");
    $("#logout").toggleClass("show");
    $("#loginContainer").toggleClass("display");
    $("#success")[0].innerText = json.message;
    $("#success-container").toggleClass("show");
    $("<h3/>", {
      class: "logged-user",
      id: "logged-user",
      text: `Hello ${loggedIn[0]?.name}`,
    }).appendTo("#header");
    $("<div/>", {
      class: "liked-list",
      id: "liked",
      text: `${loggedIn[0]?.name} ❤️`,
      click: openFav,
    }).appendTo("#headerBtns");
    const heartBtn = $("<div/>", {
      class: "liked-list-btn",
      id: "like-btn",
      text: `❤️`,
      click: addToFavorites,
    }).appendTo(".item-container #item-modal");
    setTimeout(() => {
      $("#success-container").toggleClass("show");
    }, 5000);
  } else {
    error.toggleClass("show");
    error[0].innerText = json.message;
    setTimeout(() => {
      error.toggleClass("show");
    }, 5000);
  }
}
$("#log-submit").on("click", login);

async function getFavlist() {
  const data = { user: loggedIn[0]?.email };
  console.log("OpenFav data: ", data);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/favList", options);
  const json = await response.json();
  console.log("/fav response from server:", json);
  return json;
}

async function closeFav() {
  $("#liked-items-container").empty();
  $("#liked-items-container").toggleClass("show");
  $(this).remove();
  $("#liked").toggleClass("hide");
}

async function openFav() {
  const listJson = await getFavlist();
  $("#liked-items-container")[0].innerText = "Liked items";
  $("#liked-items-container").toggleClass("show");

  $("<ul/>", {
    id: "liked-items",
  }).appendTo("#liked-items-container");

  if (listJson.list) {
    listJson.list.forEach((elm) => {
      $(elm).appendTo("#liked-items");
    });

    const deleteBtn = $("<div/>", {
      class: "delete-btn",
      id: "delete-btn",
      text: `💔`,
      click: deleteItem,
    });
    $("#liked-items #like-btn").replaceWith(deleteBtn);
  }

  $(this).toggleClass("hide");
  $("<div/>", {
    class: "liked-list",
    id: "close-list",
    text: `Close`,
    click: closeFav,
  }).appendTo("#headerBtns");
}

async function addToFavorites() {
  const currentItem = $(this)[0].parentNode.parentNode;
  const currentLikeBtn = $(this)[0];
  const data = { user: loggedIn[0]?.email, savedItem: currentItem.outerHTML };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/fav", options);
  const json = await response.json();
  console.log("/fav response from server:", json);
  if (json.message == "Item was successfully added to favList") {
    const deleteBtn = $("<div/>", {
      class: "delete-btn",
      id: "delete-btn",
      text: `💔`,
      click: deleteItem,
    });
    $(json.item).appendTo("#liked-items");
    $("#liked-items #like-btn").replaceWith(deleteBtn);
  } else {
    alert("Item already exists in your favList");
  }
}

async function deleteItem() {
  const currentItem = $(this)[0].parentNode.parentNode;
  const currentItemTitle = $(currentItem).find("div.title").text();
  const data = { user: loggedIn[0]?.email, delete: currentItemTitle };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/deleteItem", options);
  const json = await response.json();
  console.log("/fav response from server:", json);
  $(currentItem).remove();
}

async function logout() {
  loggedIn.shift();
  $("#logged-user").remove();
  $("#login").toggleClass("hide");
  $("#register").toggleClass("hide");
  $("#logout").toggleClass("show");
  if ($("#liked-items-container")[0].className.includes("show")) {
    $("#liked-items-container").toggleClass("show");
    $("#liked-items-container").empty();
  }
  $("#liked").remove();
  $("#close-list").remove();
  $(".item-container #item-modal").find("#like-btn").remove();
}
$("#logout").on("click", logout);
