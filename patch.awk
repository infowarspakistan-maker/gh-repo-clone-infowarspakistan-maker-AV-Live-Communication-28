BEGIN { state = 0; }
{
    if (NR >= 226 && NR <= 235) {
        # skip the old buttons
    } else if (NR == 253) {
        # <div ref={sliderRef} ...
        print "          <div className=\"relative group/slider\">"
        print "            <button onClick={() => scrollSlider('left')} className=\"absolute -left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 p-4 bg-white border border-gray-100 text-[#1A2B4C] rounded-full hover:bg-[#00B4D8] hover:border-[#00B4D8] hover:text-white transition-all shadow-xl hidden md:block\">"
        print "              <ArrowLeft size={20} />"
        print "            </button>"
        print "            <button onClick={() => scrollSlider('right')} className=\"absolute -right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 p-4 bg-white border border-gray-100 text-[#1A2B4C] rounded-full hover:bg-[#00B4D8] hover:border-[#00B4D8] hover:text-white transition-all shadow-xl hidden md:block\">"
        print "              <ArrowRight size={20} />"
        print "            </button>"
        print $0
    } else if (NR == 283) {
        # closing div of slider
        print $0
        print "          </div>"
    } else {
        print $0
    }
}
