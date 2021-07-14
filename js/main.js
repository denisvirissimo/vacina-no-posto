const fetchData = async () =>
    // await (await fetch('http://localhost:9000/search')).json();
    await (await fetch('/.netlify/functions/search')).json();

fetchData().then(data => {
    console.log(data);
});