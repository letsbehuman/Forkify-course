import { render } from 'sass';
import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();
    //0 results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    // 1 loading recipe
    await model.loadRecipe(id);
    // 2 rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1 get search query
    const query = searchView.getQuery();
    if (!query) return;
    //2 load search result
    await model.loadSearchResults(query);
    // 3 render results
    // console.log(model.state.search.results);
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //4 render pagination btns
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 3 render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //4 render new pagination btns
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings (in State)
  model.updateServings(newServings);

  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};
controlAddBokmark = function () {
  //1 add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //2 update recipe view
  recipeView.update(model.state.recipe);
  //3 render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();
    console.log(newRecipe);
    await model.upLoadRecipe(newRecipe);
    console.log(model.state.recipe);
    //render recipe
    recipeView.render(model.state.recipe);
    //succes msg
    addRecipeView.renderMessage();
    //bookmark view
    bookmarksView.render(model.state.bookmarks);
    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBokmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlesClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
