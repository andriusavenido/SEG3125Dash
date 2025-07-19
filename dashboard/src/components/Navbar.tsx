import { Link } from "react-router";

const Navbar: React.FC = () => {

    return (
        <div className=" text-light m-0 p-0 " >
            <div className="container-fluid p-3 nav-color d-flex justify-content-center ">
                <div className="bg-secondary p-2 rounded">
                    <h2 className="display-6"><i className="bi bi-controller"></i> Video Game Sales Charts 1980-2016</h2>
                </div>
            </div>
        </div>
    );
}

export default Navbar;