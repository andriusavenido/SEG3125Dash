import { Link } from "react-router";

const Navbar: React.FC = () => {

    return (
        <div className="navbar text-light m-0 p-0 bg-secondary" >
            <div className="container-fluid p-3 nav-color d-flex justify-content-center">
                <div className="">
                    <h2 className="display-6">Video Game Sales Charts 1980-2016</h2>
                </div>
            </div>
        </div>
    );
}

export default Navbar;