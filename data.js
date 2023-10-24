// Get HTML elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mainContainer = document.getElementById("main-container");
const searchSelect = document.getElementById("searchSelect");

// Add a click event listener to the search button
searchBtn.addEventListener("click", function() {
  // Check if the search input is empty and display an alert message if the user hasn't entered any text
  if (searchInput.value === "") {
    alert("You must write something!");
    return; // Exit the function if input is empty
  }

  const searchType = searchSelect.value; // Get the selected search type from the dropdown
  const searchTerm = searchInput.value; // Get the search term entered by the user

  let searchURL = "";

  // Construct the appropriate search URL based on the selected search type
  if (searchType === "title") {
    searchURL = `https://openlibrary.org/search.json?title=${searchTerm}`;
  } else if (searchType === "author") {
    searchURL = `https://openlibrary.org/search.json?author=${searchTerm}`;
  } else if (searchType === "all") {
    searchURL = `https://openlibrary.org/search.json?q=${searchTerm}`;
  }

  // Fetch data from the constructed search URL
  fetch(searchURL)
    .then(response => response.json())
    .then(responseJson => {
      // Check if any search results are found
      if (responseJson.numFound === 0) {
        // Display an error message if no results are found
        mainContainer.innerHTML = "<p>No results found for the search term.</p>";
        return; // Exit the function
      }

      // Clear the mainContainer before appending new results
      mainContainer.innerHTML = "";

      // Loop through each search result
      responseJson.docs.forEach(result => {
        const bookKey = result.key;

        // Fetch book details using the retrieved key
        fetch(`https://openlibrary.org${bookKey}.json`)
          .then(bookResponse => bookResponse.json())
          .then(bookJson => {
            // Extract relevant book details
            const bookTitle = bookJson.title;
            const authorName = bookJson.author_name ? bookJson.author_name.join(", ") : "Unknown Author";
            const coverID = bookJson.covers ? bookJson.covers[0] : null;
            const size = "M";
            const imageURL = coverID ? `https://covers.openlibrary.org/b/id/${coverID}-${size}.jpg` : "https://via.placeholder.com/150";

            // Create HTML content for each book result
            const bookResultHTML = `
              <div class="book-result">
                <img src="${imageURL}" alt="Book Cover"/>
                <p class="book-title">Book Title: ${bookTitle}</p>
                <p class="book-author">Author: ${authorName}</p>
                <button class="details-button">Click for details</button>
              </div>
            `;

            // Append the book result HTML to the mainContainer
            mainContainer.innerHTML += bookResultHTML;

            // Add a click event listener to the details button within this result
            const detailsButton = mainContainer.querySelector(".details-button:last-child");
            detailsButton.addEventListener("click", function() {
              // Fetch additional book details using the retrieved book key
              fetch(`https://openlibrary.org${bookKey}.json`)
                .then(detailResponse => detailResponse.json())
                .then(detailJson => {
                  const bookDescription = detailJson.description || "No description available.";

                  // Create HTML content for the book description
                  const descriptionHTML = `
                    <p class="book-description">${bookDescription}</p>
                  `;

                  // Append the description HTML to the clicked result's div
                  detailsButton.parentElement.innerHTML += descriptionHTML;
                })
                .catch(detailError => {
                  console.error("An error occurred while fetching book details:", detailError);
                });
            });
          })
          .catch(bookError => {
            console.error("An error occurred while fetching book:", bookError);
          });
      });
    })
    .catch(error => {
      console.error("An error occurred:", error);
    });
});


