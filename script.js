const apiKey = '9aa86eaf';
const moviesPerPage = 10;

// Fetch movies from OMDB API
async function fetchMovies(searchQuery, page) {
    //   const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchQuery}&page=${page}`;
    //   const response = await fetch(apiUrl);
    //   const data = await response.json();
    //   return data.Search;

    //try, catch handles the network error
    try {
        const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchQuery}&page=${page}`;
        const response = await fetch(apiUrl);

        // if the response status is not OK (200) then return error
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data.Search;
    } 
    catch (error) {
        console.error('Error fetching movies:', error.message);
        //if error  => return an empty array
        return [];
    }
}

// Display movies on the page
function displayMovies(movies) {
  const movieListDiv = document.getElementById('movieList');
  movieListDiv.innerHTML = '';

  movies.forEach(movie => {
    const movieItem = document.createElement('div');
    movieItem.className = "movieItem";
    movieItem.innerHTML = `<img src="${movie.Poster}" alt="${movie.Title}">`;
    movieItem.innerHTML += `<p>${movie.Title}</p>`;
    movieItem.addEventListener('click', () => showMovieDetails(movie.imdbID));
    movieListDiv.appendChild(movieItem);
  });
}


// Function to go to the desired page number
function goToPage(searchQuery) {
    const pageNumberInput = document.getElementById('pageNumberInput');
    const pageNumber = parseInt(pageNumberInput.value);

    if (pageNumber >= 1 && pageNumber <= totalPages) {
        loadMovies(searchQuery, pageNumber);
    } else {
        alert('Invalid page number. Please enter a number between 1 and ' + totalPages);
    }
}
  

// Pagination
// Display pagination buttons and page numbers
function displayPagination(totalResults, currentPage,searchQuery) {
    const totalPages = Math.ceil(totalResults / moviesPerPage);
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';
  
    // Create "Previous" button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => loadMovies(searchQuery, currentPage - 1));
    paginationDiv.appendChild(prevButton);

    //displays the current page number between previous button and next button
    var pageBox = document.createElement('p');
    pageBox.textContent=`Page: ${currentPage}`;
    pageBox.style.display='Inline'
    paginationDiv.appendChild(pageBox);
  
    // Display page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.disabled = currentPage === i;
      pageButton.addEventListener('click', () => loadMovies(searchQuery, i));
      paginationDiv.appendChild(pageButton);
    }
  
    // Create "Next" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => loadMovies(searchQuery, currentPage + 1));
    paginationDiv.appendChild(nextButton);


  }
  

// Fetch and display movies with pagination
async function loadMovies(searchQuery, page) {
    const movies = await fetchMovies(searchQuery, page);
    displayMovies(movies);
    displayPagination(movies.totalResults, page,searchQuery);
}

// Show movie details section
async function showMovieDetails(imdbID) {
    
    const popupContainer = document.getElementById('popupContainer');
    popupContainer.style.display = 'block';

    // const closeButton = document.getElementById('closeButton');
    // closeButton.addEventListener('click', closePopup);

    // Fetch additional movie details
    const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
    const response = await fetch(apiUrl);
    const movieDetails = await response.json();

    const popupContent = popupContainer.querySelector('.popup-content');

    //fetching existing review from local storage
    const existingReview = getReview(imdbID);
    const existingRating = existingReview ? existingReview.rating : null;
    const existingComment = existingReview ? existingReview.comment : '';

    
    // Display movie details and review form
    popupContent.innerHTML = `
        <button class="close" id="closeButton" onClick="closePopup()">&times;</button>
        <h2 class="popupTitle">${movieDetails.Title}</h2>
        <p class="para" >Release Date: ${movieDetails.Released}</p>
        <p class="para">Runtime: ${movieDetails.Runtime}</p>
        <p class="para">imdb: ${movieDetails.imdbRating}</p>
        <img class="popupImg" src="${movieDetails.Poster}" alt="${movieDetails.Title}">
        <p class="para">${movieDetails.Plot}</p>

        <p class="para">Director: ${movieDetails.Director}</p>
        <p class="para">Actors: ${movieDetails.Actors}</p>
        <div class="userReview">
            <label class=ratingLabel" for="rating">Rate the movie (1 to 5):</label>
            <input class="rating" type="number" id="rating" name="rating" min="1" max="5" value="${existingRating || ''}">
            <label class="commentLabel" for="comment">Your Comment:</label>
            <textarea class="comment" id="comment" name="comment" rows="4" cols="50">${existingComment}</textarea>
            <button class="submitButton" id="submitReview">Submit Review</button>
        </div>
    `;

    // Handle the review submission
    const submitButton = popupContent.querySelector('#submitReview');
    submitButton.addEventListener('click', () => {
        const ratingInput = popupContent.querySelector('#rating');
        const commentInput = popupContent.querySelector('#comment');

        const rating = parseInt(ratingInput.value);
        const comment = commentInput.value;

        //save rating and comment
        saveReview(imdbID, rating, comment);
    });

    popupContainer.style.display = 'block';

}

function closePopup() {
    popupContainer.style.display = 'none';
}

// Function to save the movie review in local storage
function saveReview(imdbID, rating, comment) {
    // this checks if there are existing reviews stored in local storage
    let movieReviews = JSON.parse(localStorage.getItem('movieReviews')) || {};
  
    // Save the new review
    movieReviews[imdbID] = {
      rating: rating,
      comment: comment
    };
  
    // Update the local storage with the updated reviews
    localStorage.setItem('movieReviews', JSON.stringify(movieReviews));
}

// Function to get the movie review from local storage
function getReview(imdbID) {
    const movieReviews = JSON.parse(localStorage.getItem('movieReviews')) || {};
    return movieReviews[imdbID];
}

// Handle search box input
const searchBox = document.getElementById('searchBox');
searchBox.addEventListener('input', () => {
    const searchQuery = searchBox.value.trim();
    loadMovies(searchQuery, 2);
});

// Initial load with default search (you can adjust this as needed)
const defaultSearchQuery = 'harry'; // You can use any default search term
loadMovies(defaultSearchQuery, 1);
